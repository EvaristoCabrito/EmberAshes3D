"""Compare cutout models on the Sapling cast frames where the vapor fills the whole video."""
import os
os.environ['OMP_NUM_THREADS'] = '2'
from pathlib import Path
import onnxruntime as ort
from rembg import new_session, remove
from PIL import Image, ImageDraw
W = Path(__file__).resolve().parent
opts = ort.SessionOptions(); opts.intra_op_num_threads = 2; opts.inter_op_num_threads = 1
frames = [19 + 2 * i for i in (15, 17, 19, 21, 23, 25)]  # cast-16 .. cast-26
import sys
models = sys.argv[1:] or ['isnet-general-use', 'u2net']
sheet = Image.new('RGB', (len(frames) * 220, len(models) * 150), '#bb407b'); d = ImageDraw.Draw(sheet)
out = W / 'recut-test'; out.mkdir(exist_ok=True)
for r, m in enumerate(models):
    s = new_session(m, sess_opts=opts, providers=['CPUExecutionProvider'])
    for c, f in enumerate(frames):
        cut = remove(Image.open(W / 'raw' / 'cast' / f'{f + 1:04d}.png').convert('RGB'), session=s)
        cut.save(out / f'{m}-{f}.png')
        im = cut.copy(); im.thumbnail((220, 130))
        sheet.paste(im, (c * 220, r * 150 + 18), im); d.text((c * 220 + 4, r * 150 + 3), f'{m} src{f}', fill='white')
        print(m, f, flush=True)
sheet.save(out / f"compare-{'-'.join(models)}.png")
