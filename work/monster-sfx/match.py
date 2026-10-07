"""Recovers which video frame every sprite-sheet frame was cut from (the old extractions didn't
record it), so each animation's sound can be cut from exactly that stretch of video.

For one sheet: crop the sprite to its alpha box, find its scale / mirror / position in the
candidate videos with masked template matching (sprite pixels only), then score every sheet
frame against every video frame at that placement and take the best monotonic path.
Usage: python match.py <sprite-dir> <pool-prefix> <frames> <video-substring>...
Prints JSON: chosen video, mirror, scale, source frame per sheet frame, mean score."""
import sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'video-tools'))
import cv2, numpy as np
cv2.setNumThreads(2)

ROOT = Path(__file__).resolve().parents[2]
D = Path('C:/Users/evari/Downloads')
VW = 320  # working video width

def video_frames(path):
    cap = cv2.VideoCapture(str(path)); out = []
    while True:
        ok, f = cap.read()
        if not ok: break
        h, w = f.shape[:2]
        out.append(cv2.cvtColor(cv2.resize(f, (VW, round(h * VW / w)), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32))
    return out, cap.get(cv2.CAP_PROP_FPS)

def sprite(path):
    im = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    a = im[:, :, 3]; ys, xs = np.nonzero(a > 128)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    crop = im[box[1]:box[3], box[0]:box[2]]
    gray = cv2.cvtColor(crop[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)
    mask = (crop[:, :, 3] > 200).astype(np.uint8)
    return gray, mask

def scaled(gray, mask, f, mirror):
    w, h = max(8, round(gray.shape[1] * f)), max(8, round(gray.shape[0] * f))
    g = cv2.resize(gray, (w, h), interpolation=cv2.INTER_AREA)
    m = cv2.erode(cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST), np.ones((3, 3), np.uint8)).astype(np.float32)
    if mirror: g, m = g[:, ::-1].copy(), m[:, ::-1].copy()
    return g, m

def score(frame, g, m):
    if g.shape[0] >= frame.shape[0] or g.shape[1] >= frame.shape[1] or m.sum() < 30: return -1, None
    r = cv2.matchTemplate(frame, g, cv2.TM_CCOEFF_NORMED, mask=m)
    r[~np.isfinite(r)] = -1
    _, mx, _, loc = cv2.minMaxLoc(r)
    return mx, loc

def main():
    sdir, prefix, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
    keys = sys.argv[4:]
    sheet = [sprite(ROOT / 'public/game/sprites' / sdir / f'{prefix}{i + 1}.png') for i in range(n)]
    videos = {}
    for k in keys:
        p = next((q for q in D.glob('*.mp4') if k in q.name), None)
        if p: videos[p.name] = video_frames(p)
    probe = [sheet[0], sheet[n // 2], sheet[-1]]
    best = None
    for name, (frames, fps) in videos.items():
        H = frames[0].shape[0]
        samples = frames[::max(1, len(frames) // 16)]
        for mirror in ((False, True) if 'FORCE_MIRROR' not in __import__('os').environ else (__import__('os').environ['FORCE_MIRROR'] == '1',)):
            for f in np.geomspace(0.2 * H / probe[1][0].shape[0], 1.0 * H / probe[1][0].shape[0], 22):
                tot = 0
                for g0, m0 in probe:
                    g, m = scaled(g0, m0, f, mirror)
                    tot += max(score(fr, g, m)[0] for fr in samples)
                if best is None or tot > best[0]: best = (tot, name, mirror, f)
    _, name, mirror, f = best
    # Refine the scale around the coarse pick.
    frames, fps = videos[name]
    samples = frames[::max(1, len(frames) // 24)]
    for f2 in np.linspace(f * 0.93, f * 1.07, 9):
        tot = sum(max(score(fr, *scaled(g0, m0, f2, mirror))[0] for fr in samples) for g0, m0 in probe)
        if tot > best[0]: best = (tot, name, mirror, f2)
    _, name, mirror, f = best
    # Score matrix: every sheet frame against every video frame (best placement per pair).
    S = np.full((n, len(frames)), -1.0, np.float32)
    for i, (g0, m0) in enumerate(sheet):
        g, m = scaled(g0, m0, f, mirror)
        for j, fr in enumerate(frames):
            S[i, j] = score(fr, g, m)[0]
    # Monotonic path: src[i+1] in [src[i], src[i] + 8].
    N = len(frames); dp = np.full((n, N), -1e9); bk = np.zeros((n, N), int)
    dp[0] = S[0]
    for i in range(1, n):
        for j in range(N):
            lo = max(0, j - 8); k = lo + int(np.argmax(dp[i - 1, lo:j + 1]))
            dp[i, j] = dp[i - 1, k] + S[i, j]; bk[i, j] = k
    j = int(np.argmax(dp[-1])); path = [j]
    for i in range(n - 1, 0, -1):
        j = bk[i, j]; path.append(j)
    path = path[::-1]
    print(json.dumps(dict(sprite=sdir, pool=prefix, video=name, fps=fps, mirror=mirror, scale=round(float(f), 4),
                          src=[int(x) for x in path], meanScore=round(float(np.mean([S[i, path[i]] for i in range(n)])), 3),
                          bestPerFrame=[int(np.argmax(S[i])) for i in range(n)])))

main()
