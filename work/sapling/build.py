"""Sapling: 36-frame sheets cut with the TEK (rembg isnet-general-use) plus matching sound
clips. Idle/attack/cast/hit/death are 3 s windows (every 2nd video frame) — the game's
default length for a 36-frame sheet; the walk is 1.5 s of consecutive frames (the game's
long-walk length). Frames play at real speed, so the sound cut from the same window stays in
sync. Idle gets no sound; the walk sound runs 3 s (the next steps of the same footage) so a
normal move isn't silent after the first loop."""
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
OUT = ROOT / 'public/game/sprites/sapling-001'
SFX = ROOT / 'public/game/MUSIC/SoundFX'
CUTS = W / 'cuts'
FPS = 24
N = 36

# (animation, clip, video, first video frame, frame step, sound file, sound seconds)
ACTIONS = [
    ('idle', 'idle', 'SaplingIdle.mp4', 29, 2, None, 0),
    ('move', 'walkatk', 'Sapling_walking_and_attacking.mp4', 64, 1, 'SaplingWalk001.mp3', 3.0),
    ('atk', 'walkatk', 'Sapling_walking_and_attacking.mp4', 156, 2, 'SaplingATT001.mp3', 3.0),
    ('cast', 'cast', next(D.glob('Plant_expels*.mp4')).name, 19, 2, 'SaplingCast001.mp3', 3.0),
    ('hit', 'hitdeath', 'Sapling_reaction_and_death_anim.mp4', 12, 2, 'SaplingHit001.mp3', 3.0),
    ('death', 'hitdeath', 'Sapling_reaction_and_death_anim.mp4', 149, 2, 'SaplingDeath001.mp3', 3.0),
]

opts = ort.SessionOptions(); opts.intra_op_num_threads = 2; opts.inter_op_num_threads = 1
# The cast's vapor fills the whole video around a green-lit Sapling, which isnet cuts as
# half-transparent; birefnet-general-lite keeps the body solid there, so the cast uses it.
MODEL = {'cast': 'birefnet-general-lite'}
# Cast frames 17-18 (peak of the burst): the lite model still lost part of the head; the full
# birefnet-general keeps it, along with the burst cloud the lite model keeps on frames 14-16.
FRAME_MODEL = {('cast', 17): 'birefnet-general', ('cast', 18): 'birefnet-general'}
sessions = {}
def model_for(anim, i):
    return FRAME_MODEL.get((anim, i)) or MODEL.get(anim)
def session_for(anim, i):
    name = model_for(anim, i) or 'isnet-general-use'
    if name not in sessions: sessions[name] = new_session(name, sess_opts=opts, providers=['CPUExecutionProvider'])
    return sessions[name]
def cut_file(anim, i):
    model = model_for(anim, i)
    return (CUTS / model if model else CUTS) / f'{anim}-{i}.png'
CUTS.mkdir(exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
for m in set(MODEL.values()) | set(FRAME_MODEL.values()): (CUTS / m).mkdir(exist_ok=True)

manifest = []
clock = time.time(); done = 0; total = N * len(ACTIONS)
for anim, clip, video, first, step, sound, sound_seconds in ACTIONS:
    frames = []
    for i in range(N):
        src = first + i * step
        cut_path = cut_file(anim, i + 1)
        if not cut_path.exists():
            remove(Image.open(W / 'raw' / clip / f'{src + 1:04d}.png').convert('RGB'), session=session_for(anim, i + 1)).save(cut_path)
        frames.append(dict(file=('' if anim == 'idle' else anim + '-') + f'{i + 1}.png', sourceFrame=src, seconds=round(src / FPS, 4)))
        done += 1
        print(f'{done}/{total} {anim} {i + 1} elapsed={time.time() - clock:.0f}s', flush=True)
    manifest.append(dict(animation=anim, source=str(D / video), start=round(first / FPS, 4), seconds=N * step / FPS, frames=frames, sound=sound, soundSeconds=sound_seconds))

# One shared box for every frame of every action: same scale and ground line throughout.
box = [10**6, 10**6, 0, 0]
for entry in manifest:
    for i in range(N):
        a = np.asarray(Image.open(cut_file(entry['animation'], i + 1)).getchannel('A'))
        ys, xs = np.nonzero(a > 16)
        box = [min(box[0], xs.min()), min(box[1], ys.min()), max(box[2], xs.max() + 1), max(box[3], ys.max() + 1)]
box = [int(v) for v in box]
for entry in manifest:
    for i, f in enumerate(entry['frames']):
        Image.open(cut_file(entry['animation'], i + 1)).crop(box).save(OUT / f['file'])
    entry['cuttingModel'] = MODEL.get(entry['animation'], 'isnet-general-use')
    entry['frameModels'] = {str(i): m for (a, i), m in FRAME_MODEL.items() if a == entry['animation']}
    entry['cropBox'] = box

# Sound from the same start frame, 128k/48k stereo like the other cues, 5 ms fade-in and
# 80 ms fade-out so the cut edges don't click.
for entry in manifest:
    if not entry['sound']: continue
    s = entry['soundSeconds']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f"{entry['start']:.4f}", '-t', f'{s}', '-i', entry['source'], '-vn',
                    '-af', f'afade=t=in:d=0.005,afade=t=out:st={s - 0.08}:d=0.08', '-ar', '48000', '-ac', '2', '-b:a', '128k',
                    str(SFX / entry['sound'])], check=True)

(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2))

qa = W / 'qa'; qa.mkdir(exist_ok=True)
for entry in manifest:
    sheet = Image.new('RGB', (6 * 220, 6 * 150), '#ddd'); d = ImageDraw.Draw(sheet)
    for j, f in enumerate(entry['frames']):
        im = Image.open(OUT / f['file']); im.thumbnail((220, 130))
        x, y = (j % 6) * 220, (j // 6) * 150
        d.rectangle((x, y, x + 219, y + 149), fill=['#ffffff', '#17202a', '#bb407b', '#649553'][j % 4])
        sheet.paste(im, (x, y + 18), im); d.text((x + 4, y + 3), f"{j + 1}: {f['seconds']:.2f}s", fill='black' if j % 4 == 0 else 'white')
    sheet.save(qa / f"{entry['animation']}-all-36.png")
print('BUILD COMPLETE box', box, 'size', (box[2] - box[0], box[3] - box[1]), flush=True)
