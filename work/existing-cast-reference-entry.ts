import * as THREE from 'three';
import {CausticVenomVFX} from '../src/game/gfx/three/CausticVenomVFX';
import {loadElementFlipbook} from '../src/game/gfx/three/ElementFlipbookAtlas';
import {BattleEngine} from '../src/game/engine';
import {WebGL2DRenderer} from '../src/game/gfx/WebGL2DRenderer';
async function main(){
const assets=window.__fxAssets;const originalLoad=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(url,...args){return originalLoad.call(this,assets[url.split('?')[0]]??url,...args)};
const labels=['Existing healing light','Existing potion burst','Existing lightning strike'];
const dummy={id:'reference',index:0,title:'Reference',place:'',briefing:'',objective:'',win:'rout',cols:9,rows:7,layout:['   ...   ','  .....  ',' ....... ','.........',' ....... ','  .....  ','   ...   '],decorations:[],playerSpawns:[],enemySpawns:[]};
const art=new Proxy({decorations:{}},{get:(t,k)=>t[k]??{}});
const refs=labels.map((name,i)=>{
 const canvas=document.querySelector('#ref'+i),ctx=new WebGL2DRenderer(canvas);ctx.setSize(canvas.width,canvas.height);
 const e=new BattleEngine(dummy,art,{hp:{},levels:{}},1);e.units=[];
 e.hexCenter=()=>({cx:220,cy:310});
 if(i===2)e.emitLightningFx(4,3,'raio');
 return {ctx,e,i};
});
const scene=new THREE.Scene();scene.background=new THREE.Color('#11171c');scene.add(new THREE.AmbientLight(0xffffff,1.5));
const camera=new THREE.OrthographicCamera(-450,450,280,-280,.1,2000);camera.position.set(0,0,650);camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#venom'),antialias:true,preserveDrawingBuffer:true});renderer.setSize(900,560);renderer.setPixelRatio(1);
const effect=new CausticVenomVFX(scene);
await Promise.all(['main','secondary','particles'].map(layer=>loadElementFlipbook('poison',layer,2)));
let time=0,playing=true,last=performance.now(),events=[];
function replay(){effect.cancel();time=0;events=[];effect.cast({id:'actual-birolho-venom',origin:new THREE.Vector3(-280,0,0),target:new THREE.Vector3(150,0,0),worldScale:85,impactHexes:[new THREE.Vector3(150,0,0),new THREE.Vector3(240,0,0),new THREE.Vector3(105,-80,0)],onLaunch:()=>events.push('launch'),onImpact:()=>events.push('impact'),onComplete:()=>events.push('complete')});playing=true;}
function frame(now){const dt=Math.min(.033,(now-last)/1000);last=now;if(playing){time+=dt;effect.update(dt)};
 for(const {ctx,e,i} of refs){ctx.clear();ctx.fillStyle='#11171c';ctx.fillRect(0,0,440,400);e.time=time;
 const t=Math.min(time,.95),fx={kind:i===0?'medium':'potion',t,max:1.1,seed:1.2};const k=t/fx.max,fade=Math.min(1,t/.07)*(k<.3?1:Math.max(0,1-(k-.3)/.7));
 ctx.save();ctx.globalCompositeOperation='lighter';if(i===0)e.drawDivineLight(ctx,220,310,80,fx,fade,k);if(i===1)e.drawPotionBurst(ctx,220,310,80,fx,fade,k);ctx.restore();
 if(i===2){for(const l of e.lightningFx)if(l.live)l.t=Math.min(time,.65);e.renderUnitsAndOverlays(ctx,440,400,undefined,true,true,true,true,true,true,true,true);}
 }
 renderer.render(scene,camera);window.__referenceFx={time,events:[...events],actualClasses:true,glError:renderer.getContext().getError()};requestAnimationFrame(frame);}
window.__freezeReference=()=>playing=false;window.__replayReference=replay;document.querySelector('#replay').onclick=replay;document.querySelector('#pause').onclick=()=>playing=!playing;
replay();requestAnimationFrame(frame);

}
main().catch(e=>{window.__referenceError=String(e);console.error(e)});
