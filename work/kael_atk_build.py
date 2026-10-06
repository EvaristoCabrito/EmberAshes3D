import sys, time; sys.path.insert(0,'work')
from neera_measure import measure
from kael_feet import boot_bottom
from PIL import Image
import numpy as np
D='public/game/sprites/Kael_Final/kael-final-002'; SRC='work/kael-atk-backup'; W,H=432,640
idle=Image.open(f'{D}/1.png').convert('RGBA'); ib,_=boot_bottom(idle); ih=measure(idle)['head']
# Match his idle on screen through the art only (locked engine values: atk h = idle h * 1.135,
# footOffset = 0.025h): same body size, same ground line.
TARGET_BODY=((ib-ih)/idle.height)/1.135*H
FEET_GAP=round((0.025+((idle.height-ib)/idle.height)/1.135)*H)
def save(img,path):
    for t in range(20):
        try: img.save(path); return
        except OSError: time.sleep(0.25)
    raise RuntimeError(path)
ims=[Image.open(f'{SRC}/atk-{i}.png').convert('RGBA') for i in range(1,37)]
feet=[boot_bottom(im) for im in ims]; heads=[measure(im)['head'] for im in ims]
body=np.array([f[0]-h for f,h in zip(feet,heads)],float)
pad=np.concatenate([[body[0]]*2,body,[body[-1]]*2]); trend=np.array([np.median(pad[i:i+5]) for i in range(36)])
lost=[]
for i,(im,(fy,fx)) in enumerate(zip(ims,feet),1):
    s=TARGET_BODY/trend[i-1]
    big=im.resize((round(W*s),round(H*s)),Image.LANCZOS)
    ox=round(fx-fx*s); oy=round((H-FEET_GAP)-fy*s)
    c=Image.new('RGBA',(W,H),(0,0,0,0)); c.paste(big,(ox,oy),big)
    a=np.array(big)[...,3]>40; ys,xs=np.nonzero(a); X=xs+ox; Y=ys+oy
    out=((X<0)|(X>=W)|(Y<0)|(Y>=H)).mean()
    if out>0: lost.append(f'{i}:{100*out:.2f}%')
    save(c,f'{D}/atk-{i}.png')
print('target body %.0f px, feet gap %d px'%(TARGET_BODY,FEET_GAP))
print('scale:', ' '.join('%.3f'%(TARGET_BODY/t) for t in trend))
print('art past canvas edge:', ', '.join(lost) or 'none')
