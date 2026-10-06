"""Sapling: extract raw frames, timestamped contact sheets and a loudness envelope per clip.
usage: inspect.py [step] [clip] [start] [end]"""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
W = Path(__file__).resolve().parent
D = Path('C:/Users/evari/Downloads')
CLIPS = {'idle': 'SaplingIdle.mp4', 'walkatk': 'Sapling_walking_and_attacking.mp4',
         'hitdeath': 'Sapling_reaction_and_death_anim.mp4', 'cast': next(D.glob('Plant_expels*.mp4')).name}
step = float(sys.argv[1]) if len(sys.argv) > 1 else 0.5
only = sys.argv[2] if len(sys.argv) > 2 else None
start = float(sys.argv[3]) if len(sys.argv) > 3 else 0
end = float(sys.argv[4]) if len(sys.argv) > 4 else None
(W / 'raw').mkdir(exist_ok=True); (W / 'sheets').mkdir(exist_ok=True)
for name, file in CLIPS.items():
    if only and name != only: continue
    raw = W / 'raw' / name; raw.mkdir(exist_ok=True)
    if not (raw / '0001.png').exists():
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / file), str(raw / '%04d.png')], check=True)
    frames = sorted(raw.glob('*.png'))
    last = (len(frames) - 1) / 24 if end is None else end
    times = []; t = start
    while t <= last + 1e-6: times.append(t); t += step
    cols, tw, th = 6, 320, 180
    sheet = Image.new('RGB', (cols * tw, ((len(times) + cols - 1) // cols) * th), '#111'); d = ImageDraw.Draw(sheet)
    for i, t in enumerate(times):
        idx = min(len(frames) - 1, round(t * 24))
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(Image.open(frames[idx]).convert('RGB').resize((tw, th)), (x, y))
        d.rectangle((x, y, x + 70, y + 14), fill='black'); d.text((x + 3, y + 2), f'{t:.2f}s #{idx}', fill='yellow')
    sheet.save(W / 'sheets' / f'{name}-{step}-{start}.jpg', quality=88)
    if not only or start == 0:
        a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', str(D / file), '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
        db = [20 * np.log10(max(float(np.sqrt(np.mean(a[i:i + 800] ** 2))), 1e-6)) for i in range(0, len(a) - 799, 800)]
        print(f'== {name} ({len(frames)} frames) loudness per 0.1s:'); print(' '.join(f'{v:4.0f}' for v in db))
