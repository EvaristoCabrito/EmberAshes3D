import sys, subprocess
from pathlib import Path
from PIL import Image, ImageDraw
W = Path(__file__).resolve().parent
D = Path('C:/Users/evari/Downloads')
clips = {'idle': 'Carnivorous_plant_IDLE.mp4', 'atk': 'Carnivorous_plant_ATT.mp4',
         'cast': next(D.glob('Carnivorous_plant_releases_toxic*.mp4')).name,
         'hitdeath': next(D.glob('Carnivorous_plant_hit_and_death*.mp4')).name}
step = float(sys.argv[1]) if len(sys.argv) > 1 else 0.5
only = sys.argv[2] if len(sys.argv) > 2 else None
start = float(sys.argv[3]) if len(sys.argv) > 3 else 0
end = float(sys.argv[4]) if len(sys.argv) > 4 else None
(W / 'raw').mkdir(exist_ok=True)
for name, file in clips.items():
    if only and name != only: continue
    raw = W / 'raw' / name
    raw.mkdir(exist_ok=True)
    if not (raw / '0001.png').exists():
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / file), str(raw / '%04d.png')], check=True)
    frames = sorted(raw.glob('*.png'))
    last = (len(frames) - 1) / 24 if end is None else end
    times = []
    t = start
    while t <= last + 1e-6:
        times.append(t); t += step
    cols = 6
    tw, th = 320, 180
    sheet = Image.new('RGB', (cols * tw, ((len(times) + cols - 1) // cols) * th), '#111')
    d = ImageDraw.Draw(sheet)
    for i, t in enumerate(times):
        idx = min(len(frames) - 1, round(t * 24))
        im = Image.open(frames[idx]).convert('RGB').resize((tw, th))
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(im, (x, y))
        d.rectangle((x, y, x + 70, y + 14), fill='black')
        d.text((x + 3, y + 2), f'{t:.2f}s #{idx}', fill='yellow')
    out = W / 'sheets' / f'{name}-{step}-{start}.jpg'
    sheet.save(out, quality=88)
    print(out, len(frames), 'frames')
