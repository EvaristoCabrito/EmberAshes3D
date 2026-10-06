import sys; sys.path.insert(0,'work')
from neera_measure import frames, measure
from PIL import Image, ImageOps
import time
def save(img,path):
    for t in range(20):
        try: img.save(path); return
        except OSError: time.sleep(0.25)
    raise RuntimeError('could not write '+path)
OUT='public/game/sprites/neera/neera-v2-001'
FEET_GAP=3
# sheet -> (game file prefix, mirror-left prefix or None, per-frame size correction)
SHEETS={'Idle':('idle',None,False),'ATT':('atk','atk-left',False),'Special':('atk2','atk2-left',False),'Offhand':('atk-short',None,True)}
for sheet,(prefix,left,perframe) in SHEETS.items():
    fr,_=frames(sheet); m=[measure(f) for f in fr]
    ref=m[0]['feet']-m[0]['head']
    placed=[]
    for im,mm in zip(fr,m):
        s=1.0
        if perframe:
            body=mm['feet']-mm['head']
            s=min(1.0, ref/body)   # only undo the step toward the camera; never enlarge
        if s!=1.0:
            im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
            mm=dict(feet=mm['feet']*s, boots=mm['boots']*s)
        a=im.getchannel('A').point(lambda v:255 if v>8 else 0); bb=a.getbbox()
        # extents relative to the anchor (boots centre x, feet y)
        placed.append((im,mm['boots'],mm['feet'],bb))
    halfw=max(max(mm_b-bb[0], bb[2]-mm_b) for im,mm_b,f,bb in placed)
    up=max(f-bb[1] for im,b,f,bb in placed); down=max(bb[3]-f for im,b,f,bb in placed)
    W=int(2*halfw)+4; W+=W%2
    H=int(up+max(down,0))+FEET_GAP+4
    for i,(im,b,f,bb) in enumerate(placed,1):
        c=Image.new('RGBA',(W,H),(0,0,0,0))
        c.alpha_composite(im,(round(W/2-b), round(H-FEET_GAP-f-max(down,0)) ))
        save(c,f'{OUT}/{prefix}-{i}.png')
        if left: save(ImageOps.mirror(c),f'{OUT}/{left}-{i}.png')
    print(sheet,'->',prefix,'canvas',(W,H),'ref body',ref)
