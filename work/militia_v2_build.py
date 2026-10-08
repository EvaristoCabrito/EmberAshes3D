# Cuts the Militia V2 sheets (Attachments/MilitiaV2/<Sheet>/sprite-*.png, ludo.ai 6x6 grids)
# into public/game/sprites/militia-v2/.
#
# The sheets come at DIFFERENT scales and frame sizes (Idle 432x868 frames, body 715 px tall;
# HitReact 504x806, body 800 px; Death 504x752, body 628 px), so each sheet is scaled so its
# frame-1 standing body is REF_BODY px tall, and every frame of every sheet goes on ONE shared
# canvas with the frame-1 feet of each sheet on the same anchor. Inside a sheet there is no
# per-frame re-centring, so the authored motion (stagger, fall) is kept exactly. REF_BODY is the
# smallest sheet's body height, so nothing is ever upscaled.
import glob, os
from PIL import Image, ImageOps

SRC = 'Attachments/MilitiaV2'
OUT = 'public/game/sprites/militia-v2'
FEET_GAP = 3
REF_BODY = 628
# sheet folder -> game file prefix ('' = idle frames 1..36, like cultist-v2)
SHEETS = {'Idle': '', 'HitReact': 'hit', 'Death': 'death', 'WalkRight': 'move', 'WalkLeft': 'move-left', 'ATT': 'atk'}
# ATT was drawn facing the other way (shield on the viewer's right, sword on the left, the
# opposite of Idle/Walk Right/HitReact/Death), so it is mirrored here or he would swap shield
# and sword sides every time an attack starts.
MIRROR = {'ATT'}
# Walk sheets have no standing frame 1 (it is mid-stride), so their standing height is the
# tallest frame of the cycle (the passing pose, legs together).
SCALE_BY_TALLEST = {'WalkRight', 'WalkLeft'}

os.makedirs(OUT, exist_ok=True)

def frames(sheet):
    path = glob.glob(f'{SRC}/{sheet}/*.png')[0]
    im = Image.open(path).convert('RGBA')
    cols, rows = 6, 6
    fw, fh = im.width // cols, im.height // rows
    return [im.crop(((i % cols) * fw, (i // cols) * fh, (i % cols) * fw + fw, (i // cols) * fh + fh)) for i in range(cols * rows)]

def solid(f):
    return f.getchannel('A').point(lambda v: 255 if v > 8 else 0)

prepared = {}
for sheet in SHEETS:
    fr = frames(sheet)
    if sheet in MIRROR:
        fr = [ImageOps.mirror(f) for f in fr]
    a = solid(fr[0]); b0 = a.getbbox()
    body = max(b[3] - b[1] for b in (solid(f).getbbox() for f in fr)) if sheet in SCALE_BY_TALLEST else b0[3] - b0[1]
    s = REF_BODY / body
    # Feet anchor of frame 1: midpoint of the outer edges of both feet (lowest 60 rows of the
    # body; the planted foot sits lower, so the very last rows only hold one) and the sole line.
    xs = [x for y in range(b0[3] - 60, b0[3]) for x in range(a.width) if a.getpixel((x, y))]
    ax, ay = (min(xs) + max(xs)) / 2 * s, b0[3] * s
    if s != 1:
        fr = [f.resize((round(f.width * s), round(f.height * s)), Image.LANCZOS) for f in fr]
    boxes = [solid(f).getbbox() for f in fr]
    prepared[sheet] = (fr, ax, ay, boxes, s)

# Shared canvas: extents of every frame of every sheet relative to its sheet's anchor.
left = max(ax - b[0] for fr, ax, ay, boxes, s in prepared.values() for b in boxes)
right = max(b[2] - ax for fr, ax, ay, boxes, s in prepared.values() for b in boxes)
up = max(ay - b[1] for fr, ax, ay, boxes, s in prepared.values() for b in boxes)
down = max(max(b[3] - ay for fr, ax, ay, boxes, s in prepared.values() for b in boxes), 0)
halfw = max(left, right)
W = int(halfw * 2) + 4; W += W % 2
H = int(up + down) + FEET_GAP + 4
cx, cy = W / 2, H - FEET_GAP - down

for sheet, prefix in SHEETS.items():
    fr, ax, ay, boxes, s = prepared[sheet]
    for i, f in enumerate(fr, 1):
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        c.alpha_composite(f, (round(cx - ax), round(cy - ay)))
        c.save(f'{OUT}/{i}.png' if not prefix else f'{OUT}/{prefix}-{i}.png')
    print(sheet, '->', prefix or 'idle', 'scale', round(s, 4))
print('canvas', (W, H), 'feet anchor', (round(cx), round(cy)))

