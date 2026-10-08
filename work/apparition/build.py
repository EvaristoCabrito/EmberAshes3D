"""Apparition: sheets cut with the TEK (rembg isnet-general-use) from the user's videos, plus the
cast sound. Same recipe as work/carnivorous-plant/build.py: each action is a window of its video
taking every 2nd video frame (12 fps, real speed), so frames and sound stay in sync.

- idle  (36): Woman_poses_and_casts_energy_*.mp4, smoothest 3 s loop inside 0-5.7 s.
- cast  (36): same video, 6.25-9.25 s (hands together, energy orb builds); sound = same window.
- move  (36): ApparitionWalking.mp4, smoothest 3 s loop of the profile walk (after 1.7 s).
- atk   (60): AparitionATT.mp4 from frame 74 (3.08 s, right after her walk stops) for 5 s, a
              bit longer than the usual 3 s (the engine plays it over APPARITION_ATTACK_SECONDS).
Walk and ATT face right; the game mirrors them for left-facing like any one-direction sprite.

All three videos frame her the same, except that by the ATT she has walked a little away from the
camera (about 2% smaller, 10 px higher, 20 px right). So the whole ATT sheet gets ONE scale and
shift that puts its frame 1 on idle frame 1's height, feet line and centre. Then every frame of
every sheet is cropped to one shared box (same scale and ground line throughout)."""
import os
os.environ['OMP_NUM_THREADS'] = '2'
import json, subprocess, time
from pathlib import Path
import numpy as np
import onnxruntime as ort
from rembg import new_session, remove
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
W = Path(__file__).resolve().parent
D = Path('C:/Users/evari/Downloads')
OUT = ROOT / 'public/game/sprites/apparition'
SFX = ROOT / 'public/game/MUSIC/SoundFX'
CUTS = W / 'cuts'
FPS = 24
VIDEOS = {'raw': D / 'Woman_poses_and_casts_energy_20261007224751.mp4', 'raw-walk': D / 'ApparitionWalking.mp4', 'raw-att': D / 'AparitionATT.mp4',
          'raw-hitdeath': D / 'Aparrition HitreactandDeath.mp4', 'raw-hit2': D / 'Hitreact2until4secondandSound.mp4'}

def raw(folder, i):  # 0-based video frame
    return Image.open(W / folder / f'{i + 1:04d}.png').convert('RGB')

def smoothest_loop(folder, lo, hi, span=72):
    """Start frame in [lo, hi - span) whose frame looks most like the one right after the window
    (hi = one past the last usable video frame)."""
    cands = range(lo, hi - span)
    grey = {i: np.asarray(raw(folder, i).convert('L'), dtype=np.float32) for i in set(cands) | {c + span for c in cands}}
    return min(cands, key=lambda s: float(np.mean((grey[s] - grey[s + span]) ** 2)))

idle_start = smoothest_loop('raw', 0, int(5.7 * FPS))
walk_start = smoothest_loop('raw-walk', int(1.7 * FPS), 144)
print('idle loop start', idle_start, 'walk loop start', walk_start, flush=True)

# (animation, file prefix, raw folder, first video frame, frame count, sound or None)
ACTIONS = [
    ('idle', '', 'raw', idle_start, 36, None),
    ('cast', 'cast-', 'raw', round(6.25 * FPS), 36, 'ApparitionCast001.mp3'),
    ('move', 'move-', 'raw-walk', walk_start, 36, None),
    ('atk', 'atk-', 'raw-att', 74, 60, None),
    # Hit reacts and death: 3 s each (HIT_ANIM_SECONDS / DEATH_ANIM_SECONDS). The user asked for
    # react 2's sound only, used for both hit reacts; death has no sound.
    ('hit', 'hit-', 'raw-hitdeath', round(0.5 * FPS), 36, None),
    ('hit2', 'hit2-', 'raw-hit2', round(1.0 * FPS), 36, 'ApparitionHit001.mp3'),
    ('death', 'death-', 'raw-hitdeath', round(5.0 * FPS), 36, None),
]

opts = ort.SessionOptions(); opts.intra_op_num_threads = 2; opts.inter_op_num_threads = 1
session = new_session('isnet-general-use', sess_opts=opts, providers=['CPUExecutionProvider'])
CUTS.mkdir(exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)

total = sum(a[4] for a in ACTIONS); done = 0; clock = time.time()
manifest = []
for anim, prefix, folder, first, count, sound in ACTIONS:
    frames = []
    for i in range(count):
        src = first + i * 2
        cut_path = CUTS / f'{anim}-{i + 1}.png'
        if not cut_path.exists():
            remove(raw(folder, src), session=session).save(cut_path)
        frames.append(dict(file=f'{prefix}{i + 1}.png', sourceFrame=src, seconds=round(src / FPS, 4)))
        done += 1
        print(f'{done}/{total} {anim} {i + 1} elapsed={time.time() - clock:.0f}s', flush=True)
    manifest.append(dict(animation=anim, source=str(VIDEOS[folder]), start=round(first / FPS, 4), seconds=count * 2 / FPS, frames=frames, sound=sound))

def bbox(im):
    a = np.asarray(im.getchannel('A')); ys, xs = np.nonzero(a > 16)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

# Sheets from the later videos (ATT, hit reacts, death): one scale + shift per sheet, matching its
# frame 1 (she is standing still there) to idle frame 1's height, feet line and centre, so she
# never jumps in size or place between animations.
ALIGNED = {'atk', 'hit', 'hit2', 'death'}
ref = bbox(Image.open(CUTS / 'idle-1.png'))
def fit(anim):
    f1 = bbox(Image.open(CUTS / f'{anim}-1.png'))
    s = (ref[3] - ref[1]) / (f1[3] - f1[1])
    return s, round((ref[0] + ref[2]) / 2 - (f1[0] + f1[2]) / 2 * s), round(ref[3] - f1[3] * s)
FITS = {a: fit(a) for a in ALIGNED}
# Every sheet sits in the same +100 px padded space so all coordinates line up.
def padded(anim, i):
    im = Image.open(CUTS / f'{anim}-{i}.png')
    out = Image.new('RGBA', (im.width + 200, im.height + 200), (0, 0, 0, 0))
    if anim in FITS:
        s, dx, dy = FITS[anim]
        out.alpha_composite(im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS), (dx + 100, dy + 100))
    else:
        out.alpha_composite(im, (100, 100))
    return out
print('sheet fits (scale, dx, dy)', {a: (round(v[0], 4), v[1], v[2]) for a, v in FITS.items()}, flush=True)

box = [10**6, 10**6, 0, 0]
for entry in manifest:
    for i in range(1, len(entry['frames']) + 1):
        b = bbox(padded(entry['animation'], i))
        box = [min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3])]
box = [int(v) for v in box]
for entry in manifest:
    for i, f in enumerate(entry['frames'], 1):
        padded(entry['animation'], i).crop(box).save(OUT / f['file'])
    entry['cropBox'] = box

# Sound: exactly the same window as its frames, 128k/48k stereo like the other cues, with a 5 ms
# fade-in and 80 ms fade-out so the cut edges don't click.
for entry in manifest:
    if not entry['sound']: continue
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f"{entry['start']:.4f}", '-t', f"{entry['seconds']}", '-i', entry['source'], '-vn',
                    '-af', f"afade=t=in:d=0.005,afade=t=out:st={entry['seconds'] - 0.08}:d=0.08", '-ar', '48000', '-ac', '2', '-b:a', '128k',
                    str(SFX / entry['sound'])], check=True)

(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2))

# QA sheets over alternating contrasting backgrounds.
qa = W / 'qa'; qa.mkdir(exist_ok=True)
for entry in manifest:
    n = len(entry['frames']); rows = (n + 5) // 6
    sheet = Image.new('RGB', (6 * 160, rows * 250), '#ddd'); d = ImageDraw.Draw(sheet)
    for j, f in enumerate(entry['frames']):
        im = Image.open(OUT / f['file']); im.thumbnail((160, 230))
        x, y = (j % 6) * 160, (j // 6) * 250
        d.rectangle((x, y, x + 159, y + 249), fill=['#ffffff', '#17202a', '#bb407b', '#649553'][j % 4])
        sheet.paste(im, (x, y + 18), im); d.text((x + 4, y + 3), f"{j + 1}: {f['seconds']:.2f}s", fill='black' if j % 4 == 0 else 'white')
    sheet.save(qa / f"{entry['animation']}-all-{n}.png")
print('BUILD COMPLETE box', box, 'size', (box[2] - box[0], box[3] - box[1]), 'idle feet gap', box[3] - (ref[3] + 100), flush=True)
