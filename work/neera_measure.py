from PIL import Image
import json, statistics as st
ROOT='Attachments/Nerra V2'; NAME='sprite-max-px-frames-36-rows-6-cols-6'
def frames(sheet):
    js=json.load(open(f'{ROOT}/{sheet}/{NAME}.json'))
    s=Image.open(f'{ROOT}/{sheet}/{NAME}.png').convert('RGBA'); out=[]
    for k in sorted(js['frames']):
        f=js['frames'][k]['frame']; out.append(s.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])))
    return out, sorted({js['frames'][k]['duration'] for k in js['frames']})
def measure(im):
    W,H=im.size; rgba=im.load()
    a=im.getchannel('A').point(lambda v:255 if v>40 else 0); bb=a.getbbox(); px=a.load()
    feet=bb[3]
    band=max(4,int((feet-bb[1])*0.05))
    xs=[x for y in range(feet-band,feet) for x in range(W) if px[x,y]]
    boots=st.mean(xs)
    # face: skin pixels (warm, fairly bright) in the upper 30% of the figure
    top=bb[1]; fh=feet-top
    sk=[(x,y) for y in range(top, top+int(fh*0.30)) for x in range(W)
        if rgba[x,y][3]>200 and rgba[x,y][0]>110 and rgba[x,y][0]>rgba[x,y][1]+12 and rgba[x,y][1]>rgba[x,y][2]]
    if len(sk)<30: return dict(feet=feet,boots=boots,head=None,face=None)
    fx=sorted(p[0] for p in sk); fy=sorted(p[1] for p in sk)
    cx=fx[len(fx)//2]; cy=fy[len(fy)//2]
    # hood top: first opaque row in a narrow column band over the face centre
    hw=max(6,int(fh*0.035))
    head=next(y for y in range(H) if any(px[x,y] for x in range(cx-hw,cx+hw)))
    return dict(feet=feet,boots=boots,head=head,face=(cx,cy))
if __name__=='__main__':
    for sh in ['Idle','ATT','Special','Offhand','Walk Left']:
        fr,d=frames(sh); m=[measure(f) for f in fr]
        hts=[x['feet']-x['head'] if x['head'] is not None else -1 for x in m]
        print(f'{sh:9s} {fr[0].size} dur {d}')
        print('   body', ' '.join(map(str,hts)))
        print('   feet-gap', ' '.join(str(fr[0].size[1]-x['feet']) for x in m))
        print('   bootsX', ' '.join(f"{x['boots']-fr[0].size[0]/2:+.0f}" for x in m))
