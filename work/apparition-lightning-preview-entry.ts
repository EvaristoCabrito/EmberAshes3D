import { WebGL2DRenderer } from '../src/game/gfx/WebGL2DRenderer';
import { drawApparitionLightningV1 } from '../src/game/gfx/ApparitionLightningV1';
const canvas=document.querySelector('canvas')!,ctx=new WebGL2DRenderer(canvas);ctx.setSize(canvas.width,canvas.height);
const images=(window as any).__frames.map((src:string)=>{const im=new Image();im.src=src;return im;});
const r=62,base={x:canvas.width/2,y:350},spacing=Math.sqrt(3)*r;
let direction=1,seconds=0,started=0,playing=false;
function frame(now:number){
 if(playing){seconds=Math.min(5,(now-started)/1000);if(seconds>=5)playing=false;}
 ctx.clear();ctx.fillStyle='#0b1119';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let row=-2;row<=2;row++)for(let col=-4;col<=4;col++){
  if((row===-2&&col===-4)||(row===2&&col===4))continue;
  const x=base.x+(col+(Math.abs(row)%2)*.5)*spacing,y=base.y+row*r*1.5;
  ctx.beginPath();for(let i=0;i<6;i++){const a=(i*60-30)*Math.PI/180;const px=x+r*Math.cos(a),py=y+r*Math.sin(a);i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();
  ctx.fillStyle=row===0&&(col===direction||col===2*direction)?'#263b50':'#19242f';ctx.fill();ctx.strokeStyle='#344552';ctx.lineWidth=.8;ctx.stroke();
 }
 const index=Math.min(59,Math.floor(seconds*12)),im=images[index];
 const h=196,w=h*392/637,left=base.x-w/2,top=base.y-h+34*h/637;
 if(im.complete&&im.naturalWidth){ctx.save();if(direction<0){ctx.translate(base.x,0);ctx.scale(-1,1);ctx.translate(-base.x,0);}ctx.drawImage(im,left,top,w,h);ctx.restore();}
 // Hand anchors measured from the TEK ATT sheet; the hands extend during release.
 const anchors=[[0,220,300],[.9,240,270],[1.9,245,220],[2.9,245,250],[3.5,320,200],[3.85,320,200],[4.55,320,240]];
 const next=anchors.findIndex(p=>p[0]>=seconds),a=anchors[Math.max(0,next-1)]??anchors.at(-1)!,b=anchors[next]??anchors.at(-1)!;
 const fraction=a===b?0:Math.max(0,Math.min(1,(seconds-a[0])/(b[0]-a[0])));
 const handX=a[1]+(b[1]-a[1])*fraction,handY=a[2]+(b[2]-a[2])*fraction;
 const hands={x:base.x+direction*(handX-392/2)*h/637,y:top+handY*h/637};
 const ray=[1,2].map(n=>({x:base.x+direction*n*spacing,y:hands.y}));
 drawApparitionLightningV1(ctx,hands,ray,seconds,r);
 (window as any).__apparitionPreview={seconds,frame:index+1,hexes:2,direction,glError:ctx.gl.getError()};
 document.querySelector('#time')!.textContent=`${seconds.toFixed(2)} s · ATT frame ${index+1}/60 · 2 hexes`;
 requestAnimationFrame(frame);
}
document.querySelector('#play')!.addEventListener('click',()=>{seconds=0;started=performance.now();playing=true;});
document.querySelector('#direction')!.addEventListener('change',(e:any)=>{direction=Number(e.target.value);});
document.querySelector('#scrub')!.addEventListener('input',(e:any)=>{playing=false;seconds=Number(e.target.value);});
(window as any).__setApparitionTime=(t:number)=>{playing=false;seconds=t;};requestAnimationFrame(frame);
