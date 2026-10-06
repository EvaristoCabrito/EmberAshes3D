from PIL import Image
import json, numpy as np
D='work/walk-right-0055'; NAME='sprite-max-px-frames-36-rows-6-cols-6'
def load():
    js=json.load(open(f'{D}/{NAME}.json')); s=Image.open(f'{D}/{NAME}.png').convert('RGBA')
    ks=sorted(js['frames']); W,H=js['frames'][ks[0]]['frame']['w'],js['frames'][ks[0]]['frame']['h']
    return [s.crop((js['frames'][k]['frame']['x'],js['frames'][k]['frame']['y'],js['frames'][k]['frame']['x']+W,js['frames'][k]['frame']['y']+H)) for k in ks]
def pivot(im):
    a=np.array(im.getchannel('A'))>40; ys,xs=np.nonzero(a); bot=ys.max()
    band=xs[ys>bot-25]; return float(band.mean()), float(bot)
def upper(im, piv, ang):
    # rotate about the feet pivot, return downscaled greyscale of the head+torso region
    r=im.rotate(ang, resample=Image.BICUBIC, center=piv)
    a=np.array(r.getchannel('A'))>40; ys,xs=np.nonzero(a); top=ys.min(); bot=ys.max()
    g=np.array(r.convert('LA'),dtype=np.float32); g=g[...,0]*(g[...,1]/255)
    h=bot-top; region=g[top:top+int(h*0.5)]
    # align horizontally on the feet pivot so only rotation matters
    can=np.zeros((region.shape[0],im.width+300),np.float32); ox=int(150+im.width/2-piv[0]); can[:,ox:ox+im.width]=region
    return np.array(Image.fromarray(can).resize((can.shape[1]//4,max(1,can.shape[0]//4)),Image.BILINEAR))
def tilts(fr):
    ref=upper(fr[0],pivot(fr[0]),0); out=[]
    for im in fr:
        p=pivot(im); best=None
        for ang in np.arange(-8,8.01,0.25):
            u=upper(im,p,ang); h=min(u.shape[0],ref.shape[0])
            d=np.abs(u[:h]-ref[:h]).mean()
            if best is None or d<best[0]: best=(d,ang)
        out.append(best[1])
    return out
if __name__=='__main__':
    t=tilts(load())
    print('correction angle per frame (deg, + = rotate counter-clockwise to match frame 1):')
    print(' '.join(f'{v:+.2f}' for v in t))
