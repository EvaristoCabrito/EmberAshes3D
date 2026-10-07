// Enmity + Provoke in a real battle (debug list → mission 01, user's running 8080 server,
// disposable profile). A soldier is made to hate Voss (spell damage), Kael provokes it, and
// the soldier's AI must turn on Kael.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/enmity-provoke';
mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1600,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:45000});await page.waitForTimeout(2500);};
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
    if(await page.evaluate(()=>{const e=window.__emberEngine;return !!e&&!e.getHud().pendingDialog;}))break;
  }
  for(let i=0;i<40;i++){
    const who=await page.evaluate(()=>{const e=window.__emberEngine;const s=e.units.find(u=>u.id===e.selectedId);return e.phase==='player'&&e.mode==='selected'&&s?s.name:null;});
    if(who==='Kael')break;
    if(who)await page.evaluate(()=>window.__emberEngine.wait());
    await page.waitForTimeout(1500);
  }
  const hotbar=await page.evaluate(()=>[...document.querySelectorAll('button img')].map(i=>i.getAttribute('src')).filter(s=>/provoke/.test(s??'')));
  console.log('Kael level / Provoke on hotbar:',await page.evaluate(()=>window.__emberEngine.units.find(u=>u.name==='Kael').level),JSON.stringify(hotbar));
  const r=await page.evaluate(()=>{
    const e=window.__emberEngine;
    const kael=e.units.find(u=>u.name==='Kael'),voss=e.units.find(u=>u.name==='Voss');
    const foe=e.units.filter(u=>u.side==='enemy'&&u.alive).sort((a,b)=>Math.hypot(a.x-kael.x,a.y-kael.y)-Math.hypot(b.x-kael.x,b.y-kael.y))[0];
    // Put the soldier within Provoke reach of Kael (3 rows up, same column if free).
    const occupied=new Set(e.units.filter(u=>u.alive).map(u=>u.x+','+u.y));
    for(const [dx,dy] of [[0,-3],[1,-3],[-1,-3],[0,-2],[2,-2]]){const p={x:kael.x+dx,y:kael.y+dy};if(p.x>=0&&p.y>=0&&!occupied.has(p.x+','+p.y)&&e.tiles[p.y*e.cols+p.x]!=='water'){foe.x=p.x;foe.y=p.y;foe.drawX=p.x;foe.drawY=p.y;break;}}
    e.invalidateOcc?.();
    const before=e.enmityTarget(foe)?.name??null;
    e.noteDamageEnmity(voss,foe,30,'spell');
    const afterHavoc=e.enmityTarget(foe)?.name??null;
    const logBefore=e.log.length;
    e.startProvoke();
    e.handleCell({x:foe.x,y:foe.y});
    const armed=e.getHud().spellArmed;
    e.confirmSpell();
    const afterProvoke=e.enmityTarget(foe)?.name??null;
    const provokedAll=e.units.filter(u=>u.side==='enemy'&&u.alive&&e.enmityTarget(u)?.name==='Kael').map(u=>u.name+'@'+u.x+','+u.y);
    const snap=e.captureSnapshot().enmity;
    // The soldier's own AI decision, now.
    e.queue.length=0;
    e.runAiFor(foe);
    const plan=e.queue.map(q=>q.type==='combat'?`attack ${e.units.find(u=>u.id===q.def)?.name}`:q.type==='spell'?`attack ${(q.ids??[]).map(id=>e.units.find(u=>u.id===id)?.name).join('+')} (${q.spellKind})`:q.type==='move'?`move to ${q.path.at(-1).x},${q.path.at(-1).y}`:q.type);
    const end=e.queue.filter(q=>q.type==='move').at(-1)?.path.at(-1)??{x:foe.x,y:foe.y};
    const hex=(a,b)=>{const c=(p)=>{const q=p.x-(p.y-(p.y&1))/2;return [q,p.y,-q-p.y];};const [x1,y1,z1]=c(a),[x2,y2,z2]=c(b);return Math.max(Math.abs(x1-x2),Math.abs(y1-y2),Math.abs(z1-z2));};
    e.queue.length=0;
    return {foe:foe.name+'@'+foe.x+','+foe.y,before,afterHavoc,armed,afterProvoke,kaelActed:kael.acted,provokedAll,log:e.log.slice(logBefore),snapRows:Object.keys(snap??{}).length,plan,distToKaelBefore:hex(foe,kael),distToKaelAfterPlan:hex(end,kael),distToVossAfterPlan:hex(end,voss)};
  });
  console.log(JSON.stringify(r,null,1));
  await page.screenshot({path:`${OUT}/after-provoke-${stamp}.png`});
  const ok=r.afterHavoc==='Voss'&&r.armed&&r.afterProvoke==='Kael'&&r.kaelActed&&r.log.some(l=>/Provoke/.test(l))&&r.snapRows>0&&(r.plan.some(p=>/^attack Kael\b/.test(p))||r.distToKaelAfterPlan<r.distToKaelBefore);
  console.log(ok?'PASS':'FAIL');
  console.log('errors',errors.filter(e=>!/Hydration/.test(e)));
}finally{await browser.close();}
