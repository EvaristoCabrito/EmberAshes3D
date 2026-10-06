import os
os.environ['OMP_NUM_THREADS'] = '2'
from pathlib import Path
import onnxruntime as ort
from rembg import new_session, remove
from PIL import Image, ImageDraw
W = Path(__file__).resolve().parent
opts = ort.SessionOptions(); opts.intra_op_num_threads = 2; opts.inter_op_num_threads = 1
session = new_session('isnet-general-use', sess_opts=opts, providers=['CPUExecutionProvider'])
tests = [('idle', 1), ('atk', 73), ('cast', 65), ('cast', 77), ('cast', 97), ('cast', 109), ('hitdeath', 49), ('hitdeath', 61), ('hitdeath', 205)]
out = W / 'tek-test'; out.mkdir(exist_ok=True)
sheet = Image.new('RGB', (3 * 640, len(tests) // 3 * 360 + 360), '#c0398f')
d = ImageDraw.Draw(sheet)
for i, (clip, n) in enumerate(tests):
    im = Image.open(W / 'raw' / clip / f'{n:04d}.png').convert('RGB')
    cut = remove(im, session=session)
    cut.save(out / f'{clip}-{n}.png')
    x, y = (i % 3) * 640, (i // 3) * 360
    sheet.paste(cut, (x, y), cut)
    d.text((x + 4, y + 4), f'{clip} #{n}', fill='white')
    print(clip, n, cut.getchannel('A').getbbox(), flush=True)
sheet.save(W / 'tek-test' / 'sheet.png')
