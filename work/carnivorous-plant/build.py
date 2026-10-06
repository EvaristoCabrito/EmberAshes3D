"""Carnivorous Plant: 36-frame sheets cut with the TEK (rembg isnet-general-use) plus the
matching sound clips. Every action is a 3 s window of its video (the game's default length
for a 36-frame sheet), taking every 2nd video frame, so frames and sound play at real speed
and stay in sync. Idle gets no sound."""
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
OUT = ROOT / 'public/game/sprites/carnivorous-plant-001'
SFX = ROOT / 'public/game/MUSIC/SoundFX'
CUTS = W / 'cuts'
FPS = 24
SECONDS = 3.0
N = 36

# (animation, clip, video file, start seconds, sound file or None)
ACTIONS = [
    ('idle', 'idle', 'Carnivorous_plant_IDLE.mp4', 27 / FPS, None),           # smoothest 3 s loop
    ('atk', 'atk', 'Carnivorous_plant_ATT.mp4', 2.0, 'CarnivorousPlantATT001.mp3'),
    ('cast', 'cast', next(D.glob('Carnivorous_plant_releases_toxic*.mp4')).name, 1.5, 'CarnivorousPlantCast001.mp3'),
    ('hit', 'hitdeath', next(D.glob('Carnivorous_plant_hit_and_death*.mp4')).name, 1.0, 'CarnivorousPlantHit001.mp3'),
    ('death', 'hitdeath', next(D.glob('Carnivorous_plant_hit_and_death*.mp4')).name, 6.5, 'CarnivorousPlantDeath001.mp3'),
]

opts = ort.SessionOptions(); opts.intra_op_num_threads = 2; opts.inter_op_num_threads = 1
session = new_session('isnet-general-use', sess_opts=opts, providers=['CPUExecutionProvider'])
CUTS.mkdir(exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)

manifest = []
start_clock = time.time(); done = 0
for anim, clip, video, start, sound in ACTIONS:
    first = round(start * FPS)
    frames = []
    for i in range(N):
        src = first + i * 2  # 0-based video frame
        cut_path = CUTS / f'{anim}-{i + 1}.png'
        if not cut_path.exists():
            im = Image.open(W / 'raw' / clip / f'{src + 1:04d}.png').convert('RGB')
            remove(im, session=session).save(cut_path)
        frames.append(dict(file=('' if anim == 'idle' else anim + '-') + f'{i + 1}.png', sourceFrame=src, seconds=round(src / FPS, 4)))
        done += 1
        print(f'{done}/180 {anim} {i + 1} elapsed={time.time() - start_clock:.0f}s', flush=True)
    manifest.append(dict(animation=anim, source=str(D / video), start=round(first / FPS, 4), seconds=SECONDS, frames=frames, sound=sound))

# One shared box for every frame of every action: same scale and ground line throughout.
box = [10**6, 10**6, 0, 0]
for entry in manifest:
    for i in range(N):
        a = np.asarray(Image.open(CUTS / f"{entry['animation']}-{i + 1}.png").getchannel('A'))
        ys, xs = np.nonzero(a > 16)
        box = [min(box[0], xs.min()), min(box[1], ys.min()), max(box[2], xs.max() + 1), max(box[3], ys.max() + 1)]
box = [int(v) for v in box]
for entry in manifest:
    for i, f in enumerate(entry['frames']):
        Image.open(CUTS / f"{entry['animation']}-{i + 1}.png").crop(box).save(OUT / f['file'])
    entry['cropBox'] = box

# Sound: exactly the same 3 s window as the frames, 128k/48k stereo like the other cues,
# with a 5 ms fade-in and 80 ms fade-out so the cut edges don't click.
for entry in manifest:
    if not entry['sound']: continue
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f"{entry['start']:.4f}", '-t', f'{SECONDS}', '-i', entry['source'], '-vn',
                    '-af', f'afade=t=in:d=0.005,afade=t=out:st={SECONDS - 0.08}:d=0.08', '-ar', '48000', '-ac', '2', '-b:a', '128k',
                    str(SFX / entry['sound'])], check=True)

(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2))

# QA sheets over alternating contrasting backgrounds.
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
