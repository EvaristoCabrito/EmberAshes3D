import subprocess, sys
from pathlib import Path
import numpy as np
D = Path('C:/Users/evari/Downloads')
clips = {'idle': 'Carnivorous_plant_IDLE.mp4', 'atk': 'Carnivorous_plant_ATT.mp4',
         'cast': next(D.glob('Carnivorous_plant_releases_toxic*.mp4')).name,
         'hitdeath': next(D.glob('Carnivorous_plant_hit_and_death*.mp4')).name}
for name, file in clips.items():
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(D / file), '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    win = 800  # 0.1 s
    rms = [float(np.sqrt(np.mean(a[i:i + win] ** 2))) for i in range(0, len(a) - win + 1, win)]
    db = [20 * np.log10(max(r, 1e-6)) for r in rms]
    print(f'== {name} peak {20*np.log10(np.abs(a).max()+1e-9):.1f} dBFS')
    print(' '.join(f'{d:4.0f}' for d in db))
