// Enemy-turn camera check on the user's running 8080 server (never starts one): real BattleEngine
// on a wide open board, hero far left, enemy far right, 1280x720 viewport. Plays several rounds
// (the hero just presses End Turn) and records where the acting enemy sits on screen every frame
// of its own turn — it should start centred and stay near the centre while it walks, like a
// hero. Also confirms End Turn keeps working every round.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--no-sandbox','--use-angle=d3d11']});
try{
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8080/provoke-preview.html');
  const r=await page.evaluate(async()=>{
    const {BattleEngine}=await import('/src/game/engine.ts');
    const {setMuted}=await import('/src/game/audio.ts');setMuted(true);
    const cols=26,rows=12;
    const mission={id:'cam-qa',index:0,title:'QA',place:'',briefing:'',objective:'',win:'rout',cols,rows,
      layout:Array.from({length:rows},()=>'.'.repeat(cols)),decorations:[],
      playerSpawns:[{name:'Kael',classId:'swordsman',x:1,y:6}],enemySpawns:[{name:'Foe',classId:'soldier',x:24,y:5}]};
    const art=new Proxy({decorations:{}},{get:(t,k)=>t[k]??(t[k]={})});
    const e=new BattleEngine(mission,art,{hp:{},levels:{}},1);e.rng=()=>.5;
    const W=1280,H=720;const foe=e.units.find(u=>u.side==='enemy');
    const enemyTurns=[];let cur=null;let endTurns=0;let playerTurnsSeen=0;let lastActive=null;
    for(let f=0;f<60*90&&!e.result;f++){
      e.updateCameraLayout(W,H);e.tick(1/60);
      const active=e.activeTurnUnit();
      if(active&&active.side==='player'&&!e.active&&e.queue.length===0&&e.mode!=='locked'){
        if(lastActive!==active.id+':'+e.turn){playerTurnsSeen++;lastActive=active.id+':'+e.turn;}
        e.endTurn();endTurns++;
      }
      if(e.activeUnitId===foe.id){
        e.updateCameraLayout(W,H); // what the renderer applies before drawing this frame
        const p=e.unitPixel(foe);const dx=p.cx-W/2,dy=p.cy-H/2;
        if(!cur){cur={cam0:[Math.round(e.camX),Math.round(e.camY)],layout:[Math.round(e.layout.ox),Math.round(e.layout.oy)],zoom:e.zoom,camReady:e.camReady,foeHex:[foe.x,foe.y],turn:e.turn,start:{dx:Math.round(dx),dy:Math.round(dy)},maxOff:0,minEdge:1e9,walkFrames:0};enemyTurns.push(cur);}
        cur.cam1=[Math.round(e.camX),Math.round(e.camY)];cur.maxOff=Math.max(cur.maxOff,Math.round(Math.hypot(dx,dy)));
        cur.minEdge=Math.min(cur.minEdge,Math.round(Math.min(p.cx,p.cy,W-p.cx,H-p.cy)));
        if(e.active?.type==='move'&&e.active.id===foe.id)cur.walkFrames++;
      }else cur=null;
    }
    return {enemyTurns,endTurns,playerTurnsSeen,foeAt:[foe.x,foe.y],result:e.result??null};
  });
  for(const t of r.enemyTurns)console.log('turn',t.turn,'starts at hex',t.foeHex.join(','),'start offset',Math.round(Math.hypot(t.start.dx,t.start.dy)),'max offset',t.maxOff,'closest to edge',t.minEdge,'walk frames',t.walkFrames);console.log('End Turn presses',r.endTurns);console.log('errors:',errors);
  assert.ok(r.enemyTurns.length>=2,'saw enemy turns');
  assert.ok(r.enemyTurns.some(t=>t.walkFrames>0),'enemy walked');
  // Mid-board turns start centred and stay there while walking; near the board edge the camera's
  // locked pan bounds (4 hexes past the grid) stop it short, as for heroes, but the enemy stays
  // well inside the screen.
  for(const t of r.enemyTurns){assert.ok(t.minEdge>=150,'never pushed to the screen edge');if(t.foeHex[0]>=7&&t.foeHex[0]<=20)assert.ok(Math.hypot(t.start.dx,t.start.dy)<=10,'mid-board: starts centred');}
  assert.ok(r.endTurns>=2&&r.playerTurnsSeen>=2,'End Turn keeps working');
  console.log('PASS');
}finally{await browser.close();}
