// Milícia V2 check on the user's running 8080 server (never starts one): real BattleEngine,
// real sprite art. Compares his on-screen body height and foot line with Neera V2 and Kael
// Final (all humans must match), checks every animation pool loaded, that his attack plays his
// own sound, and renders a side-by-side picture of how each unit/pose is drawn.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync, writeFileSync} from 'node:fs';
mkdirSync('screenshots/militia-v2',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--no-sandbox','--use-angle=d3d11']});
try{
  const page=await browser.newPage({viewport:{width:1600,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8080/provoke-preview.html');
  const result=await page.evaluate(async()=>{
    const {BattleEngine}=await import('/src/game/engine.ts');
    const {requestSpriteArt}=await import('/src/game/assets.ts');
    const {setMuted}=await import('/src/game/audio.ts');
    const plays=[];HTMLMediaElement.prototype.play=function(){plays.push(this.src.split('/').pop());return Promise.resolve();};
    setMuted(false);
    const pools={decorations:{}};
    const art=new Proxy(pools,{get:(t,k)=>t[k]??(t[k]={})});
    for(const id of ['militia-v2','neera','kaelFinal'])await requestSpriteArt(art,id);
    const mission={id:'militia-qa',index:0,title:'QA',place:'',briefing:'',objective:'',win:'rout',cols:10,rows:6,
      layout:['    ...   ','  ......  ',' ........ ','......... ',' .......  ','  .....   '],decorations:[],
      playerSpawns:[{name:'Neera',classId:'archer',x:2,y:3},{name:'Kael',classId:'swordsman',x:3,y:3}],
      enemySpawns:[{name:'Milícia',classId:'miliciaV2',x:4,y:3}]};
    const e=new BattleEngine(mission,art,{hp:{},levels:{}},1);e.reducedMotion=true;e.rng=()=>.5;
    const mil=e.units.find(u=>u.classId==='miliciaV2');
    const pool=k=>art[k]['militia-v2']?.length??0;
    const poolCounts={idle:pool('sprites'),hit:pool('hits'),death:pool('deaths'),walk:pool('walks'),walkLeft:pool('walksLeft'),atk:pool('attacks')};
    const tile=60;
    // Visible body (alpha bbox) of the frame actually drawn, in on-screen px, relative to the foot anchor.
    const measure=(u)=>{
      const v=e.unitVisual(u,tile);const img=v.img;
      const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
      const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;
      let top=c.height,bottom=0;
      for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx+=2)if(d[(y*c.width+xx)*4+3]>8){if(y<top)top=y;if(y>bottom)bottom=y;}
      const k=v.h/img.naturalHeight;
      return {sprite:u.sprite,src:img.src.split('/').slice(-2).join('/'),w:+v.w.toFixed(1),h:+v.h.toFixed(1),
        bodyH:+((bottom-top+1)*k).toFixed(1),feetY:+(-v.h+v.footOffset+(bottom+1)*k).toFixed(1),v,img};
    };
    const humans=e.units.map(measure);
    // Pose samples for Milícia V2: idle, attack, hit, death, walk right, walk left.
    const poses=[];const T=e.time;
    const pose=(name,setup)=>{setup();const m=measure(mil);poses.push({name,...m});e.active=null;mil.hitAt=null;mil.alive=true;mil.diedAt=null;e.time=T;};
    pose('idle',()=>{});
    // Attack: start the real combat sequence (this is also where his attack sound plays).
    e.startSeq({type:'combat',att:mil.id,def:e.units[1].id});
    const attackSounds=[...plays];
    // Same draw box for every frame of his shared canvas, so sample frames straight from the pool.
    const atkBase=measure(mil);
    for(const i of [1,9,18,27,36]){const img=art.attacks['militia-v2'][i-1];const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let top=c.height,bottom=0;for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx+=2)if(d[(y*c.width+xx)*4+3]>8){if(y<top)top=y;if(y>bottom)bottom=y;}const k=atkBase.v.h/img.naturalHeight;poses.push({...atkBase,name:`atk ${i}`,img,src:'militia-v2/atk-'+i+'.png',bodyH:+((bottom-top+1)*k).toFixed(1),feetY:+(-atkBase.v.h+atkBase.v.footOffset+(bottom+1)*k).toFixed(1)});}
    e.active=null;
    pose('hit',()=>{mil.hitAt=e.time-0.3;});
    pose('death end',()=>{mil.alive=false;mil.diedAt=e.time-10;mil.hitAt=e.time-10;});
    // Real move sequences (startSeq sets his facing from the path's screen direction).
    pose('walk right',()=>{mil.faceDx=1;mil.faceDy=0;mil.facing=1;e.startSeq({type:'move',id:mil.id,path:[{x:4,y:3},{x:5,y:3}]});});
    pose('walk left',()=>{mil.faceDx=-1;mil.faceDy=0;mil.facing=-1;e.startSeq({type:'move',id:mil.id,path:[{x:4,y:3},{x:3,y:3}]});});
    // Picture: every unit/pose drawn at its computed size on one shared ground line.
    const items=[...humans,...poses];
    const cv=document.createElement('canvas');cv.width=items.length*130+20;cv.height=260;const g=cv.getContext('2d');
    g.fillStyle='#3a3a3a';g.fillRect(0,0,cv.width,cv.height);const ground=220;
    g.strokeStyle='#4f4';g.beginPath();g.moveTo(0,ground);g.lineTo(cv.width,ground);g.stroke();
    items.forEach((it,i)=>{const cx=75+i*130;const v=it.v;g.save();g.translate(cx,ground);g.scale(v.scaleX<0?-1:1,1);
      g.drawImage(it.img,-v.w/2,-v.h+v.footOffset,v.w,v.h);g.restore();
      g.fillStyle='#fff';g.font='11px sans-serif';g.textAlign='center';g.fillText(it.name??it.sprite,cx,ground+16);g.fillText(`body ${it.bodyH}`,cx,ground+30);});
    const png=cv.toDataURL('image/png');
    const strip=o=>{const {v,img,...rest}=o;return rest;};
    // Every Milícia sound decodes.
    const decoded={};
    for(const f of ['FootSteps1.mp3','HitreactArmor.mp3','DeadArmor.mp3','FootmanLameSword.mp3']){
      const b=await(await fetch('/game/MUSIC/SoundFX/'+f)).arrayBuffer();const ac=new AudioContext();decoded[f]=+(await ac.decodeAudioData(b)).duration.toFixed(2);await ac.close();}
    return {poolCounts,humans:humans.map(strip),poses:poses.map(strip),attackSounds,decoded,png};
  });
  writeFileSync('screenshots/militia-v2/sizes-and-poses.png',Buffer.from(result.png.split(',')[1],'base64'));
  delete result.png;
  console.log(JSON.stringify(result,null,1));
  console.log('errors:',errors);
  assert.deepEqual(result.poolCounts,{idle:36,hit:36,death:36,walk:36,walkLeft:36,atk:36});
  assert.ok(result.attackSounds.includes('FootmanLameSword.mp3'),'attack sound');
  console.log('PASS: pools + attack sound');
}finally{await browser.close();}
