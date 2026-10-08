import { WebGL2DRenderer } from '../src/game/gfx/WebGL2DRenderer';
import { drawTurnUndeadV1, TURN_UNDEAD_V1_DURATION } from '../src/game/gfx/TurnUndeadV1';
import { hexAreaTiles, TURN_UNDEAD_PROGRESSION, turnUndeadPower } from '../src/game/data';
import { hexDist } from '../src/game/pathfinding';
const canvas = document.querySelector('canvas');
const ctx = new WebGL2DRenderer(canvas);ctx.setSize(canvas.width,canvas.height);
let radius = 2, paused = false, started = performance.now(), elapsed = 0;
const center={x:6,y:5},r=35;
const project = (p) => ({ x: 80 + Math.sqrt(3)*r*(p.x+(p.y&1)*.5), y: 60 + r*1.5*p.y });
const screenCell = (p) => {const c=project(p);return {...c,corners:Array.from({length:6},(_,i)=>[c.x+r*Math.cos((i*60-30)*Math.PI/180),c.y+r*Math.sin((i*60-30)*Math.PI/180)])};};
const board=hexAreaTiles(center,5,13,11).filter(p=>!(p.y<3&&p.x<5)&&!(p.y>7&&p.x>8)&&!(p.x===1));
let cells=[];
function update(){cells=board.filter(p=>hexDist(p,center)<=radius).map(screenCell);document.querySelector('#area').textContent=cells.length+' affected hexes';}
function polygon(cell){ctx.beginPath();cell.corners.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function render(now){if(!paused)elapsed=((now-started)/1000)%(TURN_UNDEAD_V1_DURATION+1);ctx.clear();ctx.fillStyle='#0b1016';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(const p of board){const c=screenCell(p);polygon(c);ctx.fillStyle=(p.x+p.y)%3===0?'#202b30':'#19242a';ctx.fill();ctx.strokeStyle='#354044';ctx.lineWidth=1;ctx.stroke();}
 drawTurnUndeadV1(ctx,cells,elapsed);window.__turnUndeadPreview={webgl:true,elapsed,cells:cells.length,glError:ctx.gl.getError()};requestAnimationFrame(render);}
 document.querySelector('#radius').addEventListener('change',e=>{radius=Number(e.target.value);update();started=performance.now();});
 document.querySelector('#replay').onclick=()=>{paused=false;started=performance.now();};
 document.querySelector('#pause').onclick=()=>{paused=!paused;if(!paused)started=performance.now()-elapsed*1000;};
 window.__setPreviewTime=(t)=>{elapsed=t;paused=true;};
 document.querySelector('tbody').innerHTML=TURN_UNDEAD_PROGRESSION.map((p,i)=>`<tr><td>${i===TURN_UNDEAD_PROGRESSION.length-1?'22+ (capped)':p.level+'–'+(TURN_UNDEAD_PROGRESSION[i+1].level-1)}</td><td>${p.range} hexes</td><td>${p.radius} ${p.radius===1?'hex':'hexes'}</td><td>${turnUndeadPower(p.level).areaHexes} hexes</td><td>⌊⌊MAG / 2⌋ × ${p.mul}⌋ + ${p.dice}D6 (${p.dice}–${p.dice*6} rolled)</td><td>2 own turns</td></tr>`).join('');
 update();requestAnimationFrame(render);
