import sys, statistics as st; sys.path.insert(0,'work')
from neera_measure import frames, measure
from PIL import Image
import time
OUT='public/game/sprites/neera/neera-v2-001'; FEET_GAP=3
def save(img,path):
    for t in range(20):
        try: img.save(path); return
        except OSError: time.sleep(0.25)
    raise RuntimeError('could not write '+path)
data={}
for sh in ['Walk Right','Walk Left']:
    fr,_=frames(sh); data[sh]=(fr,[measure(f) for f in fr])
target=st.mean(m['feet']-m['head'] for m in data['Walk Left'][1])   # what the game's walk size (471) was measured from
for sh,prefix in [('Walk Right','move'),('Walk Left','move-left')]:
    fr,m=data[sh]
    s=target/st.mean(x['feet']-x['head'] for x in m)
    cx=st.mean(x['boots'] for x in m)*s          # one horizontal shift for the whole sheet (keeps natural sway)
    placed=[]
    for im,mm in zip(fr,m):
        if abs(s-1)>1e-3: im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
        bb=im.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox()
        placed.append((im,mm['feet']*s,bb))
    halfw=max(max(cx-bb[0],bb[2]-cx) for im,f,bb in placed)
    up=max(f-bb[1] for im,f,bb in placed); down=max(max(bb[3]-f,0) for im,f,bb in placed)
    W=int(2*halfw)+4; W+=W%2; H=int(up+down)+FEET_GAP+4
    for i,(im,f,bb) in enumerate(placed,1):
        c=Image.new('RGBA',(W,H),(0,0,0,0))
        c.alpha_composite(im,(round(W/2-cx), round(H-FEET_GAP-down-f)))
        save(c,f'{OUT}/{prefix}-{i}.png')
    print(sh,'->',prefix,'scale',round(s,4),'canvas',(W,H))
