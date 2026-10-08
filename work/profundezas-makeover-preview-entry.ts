import {BattleEngine} from '../src/game/engine';
import {ThreeBattleRenderer} from '../src/game/gfx/three/ThreeBattleRenderer';
import {WebGL2DRenderer} from '../src/game/gfx/WebGL2DRenderer';
import {TILE_CHAR,TERRAIN,DECORATIONS,CLASSES,clearRockColumnTiles,decorationImage} from '../src/game/data';
import {tileVariantSrc} from '../src/game/assets';
import {footprint,computeReachable,hexNeighbors} from '../src/game/pathfinding';
import oldFile from '../src/game/maps/profundezas002.json';
import newFile from '../src/game/maps/profundezas003.json';
async function image(src:string){return await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(src));im.src=src;});}
async function main(){
 const drafts=[oldFile.draft,newFile.draft],screens=[];
 for(let k=0;k<drafts.length;k++){
 const d=drafts[k],tiles=clearRockColumnTiles(d.tiles,d.cols,d.rows,d.decorations,'nave').map(t=>TERRAIN[t]?t:'hill');
 const mission={...d,layout:Array.from({length:d.rows},(_,y)=>tiles.slice(y*d.cols,(y+1)*d.cols).map(t=>TILE_CHAR[t]).join('')),fog:false};
 const art:any={tiles:{},decorations:{},sprites:{},backdrops:{}};
 for(const id of Object.keys(TERRAIN))art.tiles[id]=[];
 const pairs=new Set(tiles.map((t,i)=>`${t}:${d.tileVariants[i]??0}`));
 await Promise.all([...pairs].filter(p=>!p.startsWith('void:')).map(async p=>{const [id,v]=p.split(':');art.tiles[id][Number(v)]=await image(tileVariantSrc(id as any,Number(v)));}));
 await Promise.all([...new Set(d.decorations.map(p=>p.id))].map(async id=>{art.decorations[id]=await image(decorationImage(id));}));
 const proxy=new Proxy(art,{get:(t,k)=>t[k]??{}});
 const e:any=new BattleEngine(mission as any,proxy,{hp:{},levels:{}},1);
 await Promise.all([...new Set(e.units.map((u:any)=>u.sprite))].map(async sprite=>{const file=sprite==='kaelFinal'?'Kael_Final/kael-final-002/1':sprite==='neera'?'neera/neera-v2-001/idle-1':`${sprite}/1`;art.sprites[sprite as string]=[await image(`/game/sprites/${file}.png`)];}));
 e.zoom=0;e.camReady=true;e.viewW=1400;e.viewH=1000;e.camX=-180;e.camY=-155;e.clampCam();e.selectedId=null;e.overlayFade=0;e.mode='locked';e.phase='enemy';
 const canvas=document.querySelector<HTMLCanvasElement>(`#map${k}`)!,renderer=new ThreeBattleRenderer(canvas,e);
 renderer.setSize(1400,1000,1);
 screens.push({e,renderer,canvas});
 if(k===1){
  const overlay=e.decorOverlay;
  const blocked=e.units.flatMap((u:any)=>footprint(u).filter(p=>e.hexAt(p.x,p.y).moveCost>=99).map(p=>`${u.name}@${p.x},${p.y}`));
  const reach=e.units.map((u:any)=>({name:u.name,cells:computeReachable(u,e.tiles,e.cols,e.rows,e.units,true,e.decorOverlay).size}));
  (window as any).__mapValidation={blocked,reach,decorations:d.decorations.length,floor:tiles.filter(t=>t!=='void').length,newRockIds:['cave-slate-shelf-001','cave-fractured-boulders-001','cave-limestone-spires-001'].every(id=>!!DECORATIONS[id])};
 }
 }
 function frame(){for(const s of screens)s.renderer.render(1400,1000,true);(window as any).__mapPreviewReady=screens.every(s=>s.renderer.isWarm());requestAnimationFrame(frame);}requestAnimationFrame(frame);
 (window as any).__setCaveCamera=(tilt:boolean)=>{for(const s of screens)s.e.tacticsCamera=tilt;};
 document.querySelector('#tilt')?.addEventListener('click',()=>{for(const s of screens)s.e.tacticsCamera=!s.e.tacticsCamera;});
}
main().catch(e=>{(window as any).__mapError=String(e);console.error(e);});
