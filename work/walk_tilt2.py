import sys; sys.path.insert(0,'work')
from walk_tilt import load
from PIL import Image
import numpy as np
def region(im, ang=0.0):
    r=im.rotate(ang, resample=Image.BICUBIC, expand=False)
    a=np.array(r.getchannel('A'))>40; ys,xs=np.nonzero(a); top=ys.min(); bot=ys.max(); h=bot-top
    g=np.array(r.convert('LA'),dtype=np.float32); g=g[...,0]*(g[...,1]/255)
    reg=g[top:top+int(h*0.42)]          # hood to waist: head + torso
    return np.array(Image.fromarray(reg).resize((reg.shape[1]//3, reg.shape[0]//3),Image.BILINEAR))
def best_shift_score(A,B):
    # normalised cross-correlation peak over all translations (FFT)
    H=max(A.shape[0],B.shape[0])*2; W=max(A.shape[1],B.shape[1])*2
    a=A-A.mean(); b=B-B.mean()
    fa=np.fft.rfft2(a,(H,W)); fb=np.fft.rfft2(b,(H,W))
    c=np.fft.irfft2(fa*np.conj(fb),(H,W))
    return c.max()/(np.linalg.norm(a)*np.linalg.norm(b)+1e-6)
def angles(fr, ref_i=0):
    ref=region(fr[ref_i]); out=[]
    for im in fr:
        sc=[(best_shift_score(ref, region(im,ang)),ang) for ang in np.arange(-12,12.01,0.5)]
        s,a=max(sc)
        fine=[(best_shift_score(ref, region(im,x)),x) for x in np.arange(a-0.5,a+0.51,0.1)]
        out.append(max(fine)[1])
    return out
if __name__=='__main__':
    fr=load(); t=angles(fr)
    print(' '.join(f'{v:+.1f}' for v in t))
