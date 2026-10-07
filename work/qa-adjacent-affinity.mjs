import assert from 'node:assert/strict';import {chromium} from 'playwright';
const b=await chromium.launch({channel:'msedge',headless:true});
try{const p=await b.newPage();await p.goto('http://127.0.0.1:8080/provoke-preview.html');const result=await p.evaluate(async()=>{
 const {BattleEngine}=await import('/src/game/engine.ts');
 const make=(overrides={})=>({id:'a',name:'Kael',side:'player',classId:'swordsman',x:3,y:3,drawX:3,drawY:3,alive:true,acted:false,summoned:false,mov:0,moveBudgetUsed:0,fullness:100,...overrides});
 const actor=make(),near=make({id:'b',name:'Neera',x:4,drawX:4}),far=make({id:'c',name:'Voss',x:8}),dead=make({id:'d',name:'Aldric',x:4,alive:false}),summon=make({id:'s',name:'Malrec',x:4,summoned:true});
 const e=Object.create(BattleEngine.prototype);Object.assign(e,{units:[actor,near,far,dead,summon],affinityScores:{},partyLeader:'Kael',attackFrom:new Map(),reach:new Map(),phase:'player',result:null});
 const logs=[];e.pushLog=s=>logs.push(s);e.noteUnitDrawAction=()=>{};e.evaluateEnd=()=>{};
 e.finishCombat(actor);const first={...e.affinityScores};e.finishAction(actor);const duplicate={...e.affinityScores};
 actor.acted=false;e.evaluateEnd=()=>{e.result='victory'};e.finishCombat(actor);const victory={...e.affinityScores};
 const saved=e.affinityScores;return {first,duplicate,victory,logs,saved};
});assert.deepEqual(result.first,{'Kael|Neera':.1});assert.deepEqual(result.duplicate,result.first);assert.deepEqual(result.victory,{'Kael|Neera':.2});assert.deepEqual(result.logs,['Afinidade Kael + Neera: +0,1','Afinidade Kael + Neera: +0,1']);console.log(result);console.log('PASS: completed attack +0.1, victory action +0.1, no duplicate award, distant/dead/summoned allies excluded, combat log entries');}finally{await b.close()}
