import {WebGL2DRenderer} from '../src/game/gfx/WebGL2DRenderer';
import {drawTurnUndeadV4,TURN_UNDEAD_V4_DURATION} from '../src/game/gfx/TurnUndeadV4';
import {hexAreaTiles,TURN_UNDEAD_PROGRESSION,turnUndeadPower} from '../src/game/data';
import {hexDist} from '../src/game/pathfinding';
const canvas=document.querySelector('canvas'),ctx=new WebGL2DRenderer(canvas);ctx.setSize(canvas.width,canvas.height);
const center={x:15,y:13},r=22;let level=6,cells=[],armed=true,started=0,elapsed=TURN_UNDEAD_V4_DURATION;
const centerWorld={x:Math.sqrt(3)*r*(center.x+(center.y&1)*.5),y:r*1.5*center.y};
const project=p=>({x:canvas.width*.5+Math.sqrt(3)*r*(p.x+(p.y&1)*.5)-centerWorld.x,y:canvas.height*.5+r*1.5*p.y-centerWorld.y});
const screenCell=p=>{const c=project(p);return {...c,corners:Array.from({length:6},(_,i)=>[c.x+r*Math.cos((i*60-30)*Math.PI/180),c.y+r*Math.sin((i*60-30)*Math.PI/180)])}};
const board=hexAreaTiles(center,11,31,27).filter(p=>hexDist(p,center)<=9 || (!(p.y<7&&p.x<12)&&!(p.y>20&&p.x>19)));
function path(c){ctx.beginPath();c.corners.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function update(){const power=turnUndeadPower(level);cells=board.filter(p=>hexDist(p,center)<=power.radius).map(screenCell);armed=true;elapsed=TURN_UNDEAD_V4_DURATION;document.querySelector('#area').textContent=`Radius ${power.radius} · ${power.areaHexes} affected hexes · centered on priest`;document.querySelector('#confirm').disabled=false;}
const priest=new Image();priest.src=window.__priestSprite;
function frame(now){if(started)elapsed=Math.min(TURN_UNDEAD_V4_DURATION,(now-started)/1000);ctx.clear();ctx.fillStyle='#0b1016';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(const p of board){const c=screenCell(p);path(c);ctx.fillStyle=(p.x+p.y)%3===0?'#202b30':'#19242a';ctx.fill();ctx.strokeStyle='#354044';ctx.lineWidth=.6;ctx.stroke();}
 if(armed){ctx.fillStyle='rgba(240,214,150,.13)';for(const c of cells){path(c);ctx.fill();}}
 if(priest.complete&&priest.naturalWidth){const h=86,w=h*priest.naturalWidth/priest.naturalHeight;ctx.drawImage(priest,canvas.width*.5-w*.5,canvas.height*.5-h+12,w,h);}
 drawTurnUndeadV4(ctx,cells,elapsed);
 window.__turnUndeadPreview={webgl:true,elapsed,cells:cells.length,armed,glError:ctx.gl.getError(),radius:turnUndeadPower(level).radius};requestAnimationFrame(frame);}
 document.querySelector('#level').onchange=e=>{level=Number(e.target.value);started=0;update();};
 document.querySelector('#preview').onclick=()=>{started=0;update();};
 document.querySelector('#confirm').onclick=()=>{armed=false;started=performance.now();document.querySelector('#confirm').disabled=true;};
 document.querySelector('#cancel').onclick=()=>{armed=false;started=0;elapsed=TURN_UNDEAD_V4_DURATION;document.querySelector('#confirm').disabled=true;};
 window.__setPreviewTime=t=>{elapsed=t;started=0;armed=false;};
 document.querySelector('tbody').innerHTML=TURN_UNDEAD_PROGRESSION.map((p,i)=>`<tr><td>${i===5?'22+ (capped)':p.level+'–'+(TURN_UNDEAD_PROGRESSION[i+1].level-1)}</td><td>${p.radius} hexes from priest</td><td>${turnUndeadPower(p.level).areaHexes} hexes</td><td>⌊⌊MAG / 2⌋ × ${p.mul}⌋ + ${p.dice}D6 (${p.dice}–${p.dice*6} rolled)</td><td>2 own turns</td></tr>`).join('');update();requestAnimationFrame(frame);
