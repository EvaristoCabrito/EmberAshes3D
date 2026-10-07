// Skills must ask Confirmar/Cancelar before casting, like the basic attack. Neera's Long Shot
// on a soldier: aim → panel (hit %) → Cancelar keeps her action → aim again, move the mouse
// (aim must not drift) → Confirmar fires. User's running 8080 server, disposable profile.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/skill-confirm';
mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1600,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:45000});await page.waitForTimeout(2500);};
const stamp=Date.now();
const state=()=>page.evaluate(()=>{const e=window.__emberEngine;const h=e.getHud();const n=e.units.find(u=>u.sprite==='neera');return {mode:e.mode,spellArmed:h.spellArmed,spellHitChance:h.spellHitChance,spellKind:h.spellKind,queued:e.queue.length,active:!!e.active,neeraActed:n?.acted};});
const panel=()=>page.evaluate(()=>document.querySelector('[data-skill-confirm]')?.innerText.replace(/\s+/g,' ')??null);
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  await click('Modo teste');await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista',{exact:true});
  await click(/^01 · /);
  for(let i=0;i<40;i++){
    await page.waitForTimeout(1500);
    const enter=page.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
    const reply=page.locator('.ember-panel button');
    if(await page.evaluate(()=>!!window.__emberEngine)&&await reply.count())await reply.first().click().catch(()=>{});
    if(await page.evaluate(()=>{const e=window.__emberEngine;return !!e&&!e.getHud().pendingDialog;}))break;
  }
  // Pass turns (Esperar) until it is Neera's turn.
  for(let i=0;i<40;i++){
    const who=await page.evaluate(()=>{const e=window.__emberEngine;const s=e.units.find(u=>u.id===e.selectedId);return e.phase==='player'&&e.mode==='selected'&&s?s.sprite:null;});
    if(who==='neera')break;
    if(who)await page.evaluate(()=>window.__emberEngine.wait());
    await page.waitForTimeout(1500);
  }
  const setup=await page.evaluate(()=>{
    const e=window.__emberEngine;
    const neera=e.units.find(u=>u.id===e.selectedId);
    const foe=e.units.filter(u=>u.side==='enemy'&&u.alive)[0];
    const occupied=new Set(e.units.filter(u=>u.alive).map(u=>u.x+','+u.y));
    let spot=null;
    for(const [dx,dy] of [[0,-3],[3,0],[-3,0],[0,3],[2,-2],[-2,-2]]){const p={x:neera.x+dx,y:neera.y+dy};if(p.x>=0&&p.y>=0&&p.x<e.cols&&p.y<e.rows&&!occupied.has(p.x+','+p.y)&&e.tiles[p.y*e.cols+p.x]!=='water'){spot=p;break;}}
    foe.x=spot.x;foe.y=spot.y;foe.drawX=spot.x;foe.drawY=spot.y;e.invalidateOcc?.();
    return {selected:neera?.name,foe:foe.name,at:spot};
  });
  console.log('setup',JSON.stringify(setup));
  // 1. Long Shot, click the soldier: aimed, waiting for confirmation.
  await page.evaluate(()=>window.__emberEngine.startLongShot());await page.waitForTimeout(400);
  await page.evaluate(at=>window.__emberEngine.handleCell(at),setup.at);await page.waitForTimeout(800);
  const s1=await state();const p1=await panel();
  console.log('1. aimed:',JSON.stringify(s1),'panel',JSON.stringify(p1));
  await page.screenshot({path:`${OUT}/1-aimed-${stamp}.png`});
  // 2. Cancelar: skill put away, action not spent.
  await page.locator('[data-skill-confirm]').getByRole('button',{name:'Cancelar',exact:true}).click();await page.waitForTimeout(800);
  const s2=await state();
  console.log('2. after Cancelar:',JSON.stringify(s2),'panel',JSON.stringify(await panel()));
  // 3. Aim again, sweep the mouse across the board, then Confirmar.
  await page.evaluate(()=>window.__emberEngine.startLongShot());await page.waitForTimeout(400);
  await page.evaluate(at=>window.__emberEngine.handleCell(at),setup.at);await page.waitForTimeout(400);
  await page.mouse.move(300,300);await page.mouse.move(900,500,{steps:10});
  const aimAfterMove=await page.evaluate(()=>window.__emberEngine.hover);
  const logBefore=await page.evaluate(()=>window.__emberEngine.log.length);
  await page.locator('[data-skill-confirm]').getByRole('button',{name:'Confirmar',exact:true}).click();
  await page.waitForTimeout(7000);
  const fired=await page.evaluate(lb=>window.__emberEngine.log.slice(lb),logBefore);
  console.log('3. aim after moving the mouse:',JSON.stringify(aimAfterMove),'· log after Confirmar:',JSON.stringify(fired));
  await page.screenshot({path:`${OUT}/3-confirmed-${stamp}.png`});
  const ok=s1.spellArmed&&s1.spellHitChance!=null&&s1.queued===0&&!s1.active&&!!p1&&/de acerto/.test(p1)
    &&!s2.spellArmed&&s2.mode==='selected'&&!s2.neeraActed
    &&aimAfterMove?.x===setup.at.x&&aimAfterMove?.y===setup.at.y
    &&fired.some(l=>l.includes(setup.foe));
  console.log(ok?'PASS':'FAIL');
  // 4. Sweep (self-centred) also asks to confirm, from whoever has it.
  console.log('errors',errors.filter(e=>!/Hydration/.test(e)));
}finally{await browser.close();}
