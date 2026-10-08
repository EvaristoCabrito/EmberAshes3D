// Apparition art check on the user's running 8080 server (never starts one): real BattleEngine
// and real sprite art. She has no class yet, so a stand-in unit is given her sprite id here only.
// Compares her drawn body height and foot line with Neera V2, checks every pool loaded, her 5 s
// attack pacing and her cast sound, and renders idle/cast/walk/ATT frames next to Neera.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync, writeFileSync} from 'node:fs';
mkdirSync('screenshots/apparition',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--no-sandbox','--use-angle=d3d11']});
try{
  const page=await browser.newPage({viewport:{width:1600,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8080/provoke-preview.html');
  const result=await page.evaluate(async()=>{
    const {BattleEngine}=await import('/src/game/engine.ts');
    const {requestSpriteArt}=await import('/src/game/assets.ts');
    const {setMuted,sfxPlay}=await import('/src/game/audio.ts');
    const plays=[];HTMLMediaElement.prototype.play=function(){plays.push(this.src.split('/').pop());return Promise.resolve();};
    setMuted(false);
    const pools={decorations:{}};const art=new Proxy(pools,{get:(t,k)=>t[k]??(t[k]={})});
    for(const id of ['apparition','neera'])await requestSpriteArt(art,id);
    const mission={id:'app-qa',index:0,title:'QA',place:'',briefing:'',objective:'',win:'rout',cols:10,rows:6,
      layout:['    ...   ','  ......  ',' ........ ','......... ',' .......  ','  .....   '],decorations:[],
      playerSpawns:[{name:'Neera',classId:'archer',x:2,y:3}],enemySpawns:[{name:'Apparition',classId:'apparition',x:4,y:3}]};
    const e=new BattleEngine(mission,art,{hp:{},levels:{}},1);e.reducedMotion=true;e.rng=()=>.5;
    const app=e.units[1];const {CLASSES}=await import('/src/game/data.ts');const undead=CLASSES.apparition.undead;
    const pool=k=>art[k]['apparition']?.length??0;
    const poolCounts={idle:pool('sprites'),cast:pool('casts'),walk:pool('walks'),atk:pool('attacks'),hit:pool('hits'),hit2:pool('hits2'),death:pool('deaths')};
    const tile=60;const base=e.unitVisual(app,tile);
    const measureImg=(img,v)=>{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let top=c.height,bottom=0;for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx+=2)if(d[(y*c.width+xx)*4+3]>16){if(y<top)top=y;if(y>bottom)bottom=y;}const k=v.h/img.naturalHeight;return {bodyH:+((bottom-top+1)*k).toFixed(1),feetY:+(-v.h+v.footOffset+(bottom+1)*k).toFixed(1)};};
    const neeraV=e.unitVisual(e.units[0],tile);
    const items=[{name:'neera',img:neeraV.img,v:neeraV,...measureImg(neeraV.img,neeraV)}];
    const add=(name,img)=>items.push({name,img,v:base,...measureImg(img,base)});
    add('idle 1',art.sprites.apparition[0]);add('idle 18',art.sprites.apparition[17]);
    add('cast 1',art.casts.apparition[0]);add('cast 30',art.casts.apparition[29]);
    add('walk 1',art.walks.apparition[0]);add('walk 18',art.walks.apparition[17]);
    for(const i of [1,20,40,45,60])add('atk '+i,art.attacks.apparition[i-1]);
    add('hit 8',art.hits.apparition[7]);add('hit2 8',art.hits2.apparition[7]);add('death 1',art.death?.apparition?.[0]??art.deaths.apparition[0]);add('death 36',art.deaths.apparition[35]);
    // Hit rotation: six separate hits, each read over several frames like the renderer does.
    const rotation=[];for(let k=0;k<6;k++){app.hitAt=e.time+k*10;e.time=app.hitAt+0.5;let src;for(let r=0;r<3;r++)src=e.unitVisual(app,tile).img.src;rotation.push(src.split('/').pop().replace(/-\d+\.png.*/,''));}app.hitAt=null;
    plays.length=0;sfxPlay.monster('apparition','hit');const hitPlays=[...plays];
    // 5 s attack: the combat clock is stretched so lunge+hit+recover (0.54 s) spans 5 s.
    e.startSeq({type:'combat',att:app.id,def:e.units[0].id});
    const atkPace=e.longSheetActionPace(e.active,1);e.active=null;
    // Cast sound.
    plays.length=0;const castCue=sfxPlay.monster('apparition','cast');const castPlays=[...plays];
    const ab=await(await fetch('/game/MUSIC/SoundFX/ApparitionCast001.mp3')).arrayBuffer();const ac=new AudioContext();const castSeconds=+(await ac.decodeAudioData(ab)).duration.toFixed(2);await ac.close();
    const cv=document.createElement('canvas');cv.width=items.length*120+20;cv.height=250;const g=cv.getContext('2d');
    g.fillStyle='#3a3a3a';g.fillRect(0,0,cv.width,cv.height);const ground=205;
    g.strokeStyle='#4f4';g.beginPath();g.moveTo(0,ground);g.lineTo(cv.width,ground);g.stroke();
    items.forEach((it,i)=>{const cx=70+i*120;g.drawImage(it.img,cx-it.v.w/2,ground-it.v.h+it.v.footOffset,it.v.w,it.v.h);g.fillStyle='#fff';g.font='11px sans-serif';g.textAlign='center';g.fillText(it.name,cx,ground+16);g.fillText('body '+it.bodyH,cx,ground+30);});
    return {undead,rotation,hitPlays,poolCounts,items:items.map(({img,v,...r})=>r),atkPace:+atkPace.toFixed(4),expectedPace:+(0.54/5).toFixed(4),castCue,castPlays,castSeconds,png:cv.toDataURL('image/png')};
  });
  writeFileSync('screenshots/apparition/sizes-and-poses.png',Buffer.from(result.png.split(',')[1],'base64'));delete result.png;
  console.log(JSON.stringify(result));console.log('errors:',errors);
  assert.deepEqual(result.poolCounts,{idle:36,cast:36,walk:36,atk:60,hit:36,hit2:36,death:36});
  assert.deepEqual(result.rotation,['hit','hit','hit2','hit','hit','hit2']);
  assert.deepEqual(result.hitPlays,['ApparitionHit001.mp3']);
  assert.equal(result.undead,'ghost');
  assert.equal(result.atkPace,result.expectedPace);
  assert.deepEqual(result.castPlays,['ApparitionCast001.mp3']);
  console.log('PASS');
}finally{await browser.close();}
