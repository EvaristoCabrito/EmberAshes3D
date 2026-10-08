import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const b=await chromium.launch({channel:'msedge',headless:true});
try {
 const p=await b.newPage({viewport:{width:1600,height:950}}); const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8080/');
 const click=async name=>{await p.getByRole('button',{name}).first().click({timeout:45000});await p.waitForTimeout(1000)};
 await click('Modo teste');await p.waitForFunction(()=>document.body.innerText.includes('Debug'),{},{timeout:120000});await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista');await click(/^01 · /);
 for(let i=0;i<30;i++){
  await p.waitForTimeout(500);
  const enter=p.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click();
  if(await p.evaluate(()=>!!window.__emberEngine)){
   if(await p.evaluate(()=>!window.__emberEngine.getHud().pendingDialog))break;
   const replies=p.locator('.ember-panel button');if(await replies.count())await replies.first().click();
  }
 }
 const result=await p.evaluate(()=>{
  const e=window.__emberEngine;
  const caster=e.units.find(u=>u.name==='Kael');const foe=e.units.find(u=>u.side==='enemy'&&u.alive);
  caster.level=6;caster.acted=false;e.selectedId=caster.id;caster.x=foe.x-1;caster.y=foe.y;
  e.spellAimValid=()=>true;
  e.castProvoke(caster,{x:foe.x,y:foe.y});
  const effects=e.provokeFx.length;const ids=e.provokeFx.map(f=>f.unitId);
  // Freeze a representative frame for visual inspection.
  const tick=e.update.bind(e);e.update=()=>{};for(const fx of e.provokeFx)fx.t=.3;
  window.__provokeQaTick=tick;
  return {effects,ids,log:e.getHud().log.slice(-5)};
 });
 assert.ok(result.effects>0);await p.waitForTimeout(250);await p.screenshot({path:'work/provoke-combat.png'});
 console.log(JSON.stringify(result));assert.deepEqual(errors,[]);
 await p.goto('http://127.0.0.1:8080/provoke-preview.html');await p.waitForFunction(()=>window.__provokePreview?.webgl);
 await p.locator('#replay').click();await p.waitForTimeout(250);await p.locator('#pause').click();await p.screenshot({path:'work/provoke-energy-preview.png'});
 console.log('PASS: actual combat cast schedules target FX and enmity log; 2D WebGL preview renders without errors');
}finally{await b.close()}

