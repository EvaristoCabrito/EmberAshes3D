// Clicking an enemy must stage the attack and show hit % / damage / counter with
// Confirmar / Cancelar — nothing happens until Confirmar. User's running 8080 server,
// disposable profile, debug list → mission 01. Screenshots every step.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/attack-confirm';
mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1600,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:10000});await page.waitForTimeout(2500);};
const stamp=Date.now();
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  await click('Modo teste');await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista',{exact:true});
  await click(/^01 · /);
  for(let i=0;i<40;i++){
    await page.waitForTimeout(1500);
    const enter=page.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
    const reply=page.locator('.ember-panel button');
    if(await page.evaluate(()=>!!window.__emberEngine)&&await reply.count())await reply.first().click().catch(()=>{});
    if(await page.evaluate(()=>{const e=window.__emberEngine;return !!e&&!e.getHud().pendingDialog&&e.phase==='player'&&!!e.selectedId&&e.mode==='selected';}))break;
  }
  await page.waitForTimeout(1500);
  // Put the nearest enemy right next to the active hero so it is attackable.
  const setup=await page.evaluate(()=>{
    const e=window.__emberEngine;
    const hero=e.units.find(u=>u.id===e.selectedId);
    const foe=e.units.filter(u=>u.side==='enemy'&&u.alive)[0];
    const occupied=new Set(e.units.filter(u=>u.alive).map(u=>u.x+','+u.y));
    const odd=hero.y&1;
    const n=[[1,0],[-1,0],[odd?1:0,-1],[odd?0:-1,-1],[odd?1:0,1],[odd?0:-1,1]].map(([dx,dy])=>({x:hero.x+dx,y:hero.y+dy})).find(p=>p.x>=0&&p.y>=0&&p.x<e.cols&&p.y<e.rows&&!occupied.has(p.x+','+p.y));
    foe.x=n.x;foe.y=n.y;foe.drawX=n.x;foe.drawY=n.y;e.invalidateOcc?.();
    e.attackFrom=e.visibleAttackTargets(hero);
    return {hero:hero.name,foe:foe.name,foeId:foe.id,at:n,hp:foe.hp};
  });
  console.log('setup',JSON.stringify(setup));
  const clickFoe=()=>page.evaluate(at=>window.__emberEngine.handleCell(at),setup.at);
  // 1. Click the enemy: staged, no attack queued.
  await clickFoe();await page.waitForTimeout(800);
  const staged=await page.evaluate(()=>{const e=window.__emberEngine;const h=e.getHud();return {pendingFoe:h.pendingFoe?.name??null,forecast:h.forecast,queued:e.queue.length,active:!!e.active,acted:e.units.find(u=>u.id===e.selectedId)?.acted};});
  const panel=await page.evaluate(()=>[...document.querySelectorAll('.ember-plate')].map(p=>p.innerText.replace(/\s+/g,' ')).find(t=>/de acerto/.test(t))??null);
  console.log('1. after clicking the enemy:',JSON.stringify(staged));
  console.log('   panel:',JSON.stringify(panel));
  await page.screenshot({path:`${OUT}/1-staged-${stamp}.png`});
  // 2. Cancelar: nothing happens, hero keeps the action.
  await page.locator('[data-attack-confirm]').getByRole('button',{name:'Cancelar',exact:true}).click();await page.waitForTimeout(800);
  const cancelled=await page.evaluate(()=>{const e=window.__emberEngine;return {pendingFoe:e.getHud().pendingFoe?.name??null,queued:e.queue.length,active:!!e.active,acted:e.units.find(u=>u.id===e.selectedId)?.acted};});
  const panelAfterCancel=await page.evaluate(()=>[...document.querySelectorAll('.ember-plate')].some(p=>/de acerto/.test(p.innerText)));
  console.log('2. after Cancelar:',JSON.stringify(cancelled),'panel visible',panelAfterCancel);
  await page.screenshot({path:`${OUT}/2-cancelled-${stamp}.png`});
  // 3. Click again, Confirmar: the attack runs.
  await clickFoe();await page.waitForTimeout(800);
  const logBefore=await page.evaluate(()=>window.__emberEngine.log.length);
  await page.locator('[data-attack-confirm]').getByRole('button',{name:'Confirmar',exact:true}).click();
  await page.waitForTimeout(6000);
  const confirmed=await page.evaluate(lb=>{const e=window.__emberEngine;return {newLog:e.log.slice(lb),pendingFoe:e.getHud().pendingFoe?.name??null};},logBefore);
  console.log('3. after Confirmar:',JSON.stringify(confirmed));
  await page.screenshot({path:`${OUT}/3-confirmed-${stamp}.png`});
  const ok=staged.pendingFoe===setup.foe&&staged.queued===0&&!staged.active&&!!panel&&cancelled.pendingFoe===null&&!cancelled.acted&&!panelAfterCancel&&confirmed.newLog.some(l=>l.includes(setup.foe)||/atacou/.test(l));
  console.log(ok?'PASS':'FAIL');
  console.log('errors',errors.filter(e=>!/Hydration/.test(e)));
}finally{await browser.close();}
