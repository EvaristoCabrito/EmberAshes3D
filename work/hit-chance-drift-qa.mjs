// Why does the attack panel's hit % change every round? Plays rounds of O Vau where everyone
// just waits (no attacks, so no skill can grow) and records, per round, each hero's hit % vs
// one fixed soldier plus every input of the formula: 75 + weapon skill + Bless − target DEX.
// User's running 8080 server, disposable profile, debug list → mission 01.
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1600,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:45000});await page.waitForTimeout(2500);};
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
  const sample=()=>page.evaluate(()=>{
    const e=window.__emberEngine;
    const soldier=e.units.find(u=>u.id==='enemy-Soldado-0')??e.units.find(u=>u.side==='enemy'&&u.alive);
    const out={turn:e.turn,soldier:{id:soldier.id,dex:soldier.dex,level:soldier.level},heroes:{}};
    for(const h of e.units.filter(u=>u.side==='player'&&u.alive&&!u.summoned)){
      // The exact forecast the panel shows, with this hero as attacker.
      const sel=e.selectedId,insp=e.inspectedId,mode=e.mode;
      e.selectedId=h.id;e.inspectedId=soldier.id;e.mode='selected';
      const f=e.getHud().forecast;
      e.selectedId=sel;e.inspectedId=insp;e.mode=mode;
      out.heroes[h.name]={hit:f?.hitOut??null,skills:JSON.stringify(h.weaponSkills),bless:h.blessedHitBonusPct??0,weapon:h.weaponId,offHand:h.offHandId??null};
    }
    return out;
  });
  const rounds=[];
  let lastTurn=-1;
  for(let step=0;step<200&&rounds.length<5;step++){
    const t=await page.evaluate(()=>window.__emberEngine.turn);
    if(t!==lastTurn){rounds.push(await sample());lastTurn=t;}
    const who=await page.evaluate(()=>{const e=window.__emberEngine;const s=e.units.find(u=>u.id===e.selectedId);return e.phase==='player'&&e.mode==='selected'&&s?s.name:null;});
    if(who)await page.evaluate(()=>window.__emberEngine.wait());
    await page.waitForTimeout(700);
  }
  for(const r of rounds){
    console.log(`round ${r.turn} · ${r.soldier.id} DEX ${r.soldier.dex} (lv ${r.soldier.level})`);
    for(const [name,h] of Object.entries(r.heroes))console.log(`   ${name.padEnd(8)} hit ${String(h.hit).padStart(3)}%  skills ${h.skills}  bless ${h.bless}  weapon ${h.weapon} offHand ${h.offHand}`);
  }
  console.log('errors',errors.filter(e=>!/Hydration/.test(e)));
}finally{await browser.close();}
