import numpy as np
from PIL import Image
def boot_bottom(im, min_run=22):
    """Lowest row containing a solid (alpha>200) horizontal run at least boot-wide; skips thin
    sword tips and the soft baked shadow."""
    a=np.array(im)[...,3]>200
    for y in range(a.shape[0]-1,-1,-1):
        row=a[y]
        if not row.any(): continue
        # longest run in this row
        d=np.diff(np.concatenate([[0],row.astype(int),[0]])); starts=np.nonzero(d==1)[0]; ends=np.nonzero(d==-1)[0]
        runs=ends-starts
        if runs.max()>=min_run:
            k=np.argmax(runs); return y+1, (starts[k]+ends[k])/2
    return None, None
