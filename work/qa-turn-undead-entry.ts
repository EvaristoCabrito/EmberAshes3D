import assert from 'node:assert/strict';
import { BattleEngine } from '../src/game/engine';
import { TURN_UNDEAD_PROGRESSION, turnUndeadPower, spellTier, isUndeadClass, hexAreaTiles, CLASSES } from '../src/game/data';
import { hexDist } from '../src/game/pathfinding';
assert.equal(spellTier('createFoodAndWater'),4);assert.equal(spellTier('turnUndead'),3);
for(let level=1;level<=30;level++){
 const p=turnUndeadPower(level);const cells=hexAreaTiles({x:12,y:12},p.radius,25,25);
 assert.equal(cells.length,p.areaHexes);assert.ok(cells.every(c=>hexDist(c,{x:12,y:12})<=p.radius));
 if(level>1){const prev=turnUndeadPower(level-1);for(const k of ['range','radius','dice','mul'])assert.ok(p[k]>=prev[k]);}
 if(level>=22)assert.deepEqual(p,turnUndeadPower(22));
}
for(const id of ['zombie','zombie2','zombieDog','undeadOx','plagueBearingCattle','emberedWraith','apparition'])assert.equal(isUndeadClass(id),true);
for(const id of Object.keys(CLASSES))assert.equal(isUndeadClass(id),CLASSES[id].creatureType==='undead');
const cols=17,rows=13,board=new Set(hexAreaTiles({x:8,y:6},6,cols,rows).map(c=>c.x+','+c.y));
const layout=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>board.has(x+','+y)?'.':' ').join(''));
const mission={id:'turn-undead-qa',index:0,title:'QA',place:'',briefing:'',objective:'',win:'rout',cols,rows,layout,decorations:[],playerSpawns:[{name:'Priest',classId:'healer',x:6,y:6,level:12}],enemySpawns:[{name:'Zombie',classId:'zombie',x:8,y:6},{name:'Militia',classId:'miliciaV2',x:8,y:5},{name:'Ox',classId:'undeadOx',x:9,y:7},{name:'Outside',classId:'zombie',x:15,y:6}]};
const art=new Proxy({decorations:{}},{get:(t,k)=>t[k]??{}});
const e=new BattleEngine(mission,art,{hp:{},levels:{}},1);e.reducedMotion=true;e.rng=()=>.5;
const caster=e.units[0];caster.level=12;caster.mag=0;caster.acted=false;caster.spells.tier3=5;e.selectedId=caster.id;
for(const u of e.units){u.hp=u.maxHp=5000;u.resistances={};}
const zombie=e.units.find(u=>u.name==='Zombie'),living=e.units.find(u=>u.name==='Militia'),ox=e.units.find(u=>u.name==='Ox'),outside=e.units.find(u=>u.name==='Outside');
const before=JSON.stringify(living);e.startTurnUndead();assert.equal(e.spellKind,'turnUndead');assert.equal(e.mode,'awaitSpell');assert.equal(caster.spells.tier3,5);assert.equal(e.queue.length,0);assert.equal(e.getHud().spellArmed,true);assert.equal(e.getHud().spellReady,true);
e.cancelSkillConfirm();assert.equal(caster.spells.tier3,5);assert.equal(e.queue.length,0);assert.equal(caster.acted,false);
e.startTurnUndead();e.hover={x:15,y:6};assert.equal(e.getHud().spellReady,true);e.confirmSpell();assert.equal(e.spellKind,null);assert.equal(e.mode,'locked');assert.equal(caster.spells.tier3,4);assert.equal(e.queue.length,1);e.confirmSpell();assert.equal(e.queue.length,1);
const step=e.queue.shift();assert.ok(step.ids.includes(zombie.id));assert.ok(step.ids.includes(ox.id));assert.equal(new Set(step.ids).size,step.ids.length);assert.ok(!step.ids.includes(living.id));assert.ok(!step.ids.includes(outside.id));
e.startSeq(step);assert.equal(e.active.type,'spell');const action=e.active;e.stepSpell(action,.5);
assert.ok(zombie.hp<5000);assert.ok(ox.hp<5000);assert.equal(zombie.fearTurns,2);assert.equal(zombie.fearSourceId,caster.id);assert.equal(JSON.stringify(living),before);assert.equal(outside.hp,5000);assert.equal(outside.fearTurns??0,0);
assert.equal(e.turnUndeadFx.length,1);assert.deepEqual(e.turnUndeadFx[0].tiles,step.tiles);
e.stepSpell(action,.1);assert.equal(e.turnUndeadFx.length,1);
// Guard against malformed/stale queued targets: living creatures must remain entirely unaffected.
e.active=null;e.startSeq({...step,ids:[living.id]});e.stepSpell(e.active,.5);assert.equal(JSON.stringify(living),before);
// Fear survives save/load, including the original source.
const saved=e.captureSnapshot();const copy=new BattleEngine(mission,art,{hp:{},levels:{}},1);copy.applySnapshot(saved);
const restored=copy.units.find(u=>u.id===zombie.id);assert.equal(restored.fearTurns,2);assert.equal(restored.fearSourceId,caster.id);
// Battle-side food casting consumes Tier 4, preserving the Tier 3 pool.
const food=new BattleEngine(mission,art,{hp:{},levels:{}},1);const priest=food.units[0];priest.level=12;priest.fullness=0;priest.acted=false;priest.spells.tier3=4;priest.spells.tier4=3;food.selectedId=priest.id;
food.startCreateFoodAndWater();assert.equal(priest.spells.tier4,2);assert.equal(priest.spells.tier3,4);assert.equal(priest.fullness,120);
// A frightened unit queues only a reachable retreat, consumes one fear turn, and cannot attack.
e.active=null;e.queue=[];e.skipStartOfTurn=false;zombie.moved=false;zombie.acted=false;
e.beginUnitTurn(zombie);assert.equal(zombie.fearTurns,1);assert.equal(zombie.acted,true);assert.ok(e.queue.every(s=>s.type==='move'));
assert.ok(e.queue.length>0);const retreat=e.queue[0];assert.ok(hexDist(retreat.path.at(-1),caster)>hexDist(zombie,caster));
// A surrounded/restrained victim still loses its attack when no retreat is possible.
e.queue=[];zombie.mov=0;zombie.moved=false;zombie.acted=false;e.skipStartOfTurn=false;e.beginUnitTurn(zombie);assert.equal(zombie.fearTurns,0);assert.equal(zombie.acted,true);assert.equal(e.queue.length,0);
console.log('PASS: both spell tiers, all level breakpoints and hex footprints, cap at 22, undead classification, living immunity, multi-hex deduplication, damage/fear, legal retreat, and trapped fear turns.');
