// The battle intro dialog must never reopen after saving (or loading) the game. Real campaign
// flow in a disposable profile on the user's running 8080 server: a slot sitting at O Vau's
// briefing → enter → answer the intro → Options → save → back; then load that save.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/dialog-save-repeat';
mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1600,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const buttons=async()=>JSON.stringify(await page.getByRole('button').evaluateAll(b=>b.map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().replace(/\s+/g,' ').slice(0,40)).filter(Boolean)));
const dialogOpen=()=>page.evaluate(()=>!!document.querySelector('.ember-panel .ember-kicker')&&[...document.querySelectorAll('.ember-panel button')].length>0&&!!window.__emberEngine);
const intro=async()=>page.evaluate(()=>{const p=document.querySelector('.absolute.inset-0.z-50 .ember-panel');return p?p.innerText.slice(0,80):null;});
let step=0;const shot=async n=>page.screenshot({path:`${OUT}/${String(++step).padStart(2,'0')}-${n}.png`});
async function continueSlot1(){
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  const cont=page.getByRole('button',{name:/^(Continuar|Continue)/i});
  for(let i=0;i<180&&!(await cont.first().isEnabled());i++)await page.waitForTimeout(1000);
  await cont.first().click();await page.waitForTimeout(1500);
  await page.getByText(/Slot 1/i).first().click();await page.waitForTimeout(2000);
  for(let i=0;i<40;i++){
    const enter=page.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
    if(await page.evaluate(()=>!!window.__emberEngine))break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);
}
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  const saveUrl=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/src\/game\/save\.ts/.test(n)));
  await page.evaluate(async u=>{const s=await import(u);const bank=s.loadBank();s.writeSlot(bank,0,{...s.activeSave(bank),pendingMission:'vau',battle:null});},saveUrl);
  await continueSlot1();
  console.log('1. battle start: intro dialog shown =',JSON.stringify(await intro()));
  await shot('battle-start');
  // Answer the intro until it closes.
  for(let i=0;i<10&&await intro();i++){await page.locator('.absolute.inset-0.z-50 .ember-panel button').first().click();await page.waitForTimeout(700);}
  console.log('2. after answering: intro =',JSON.stringify(await intro()));
  // Options → save to slot 1.
  await page.getByRole('button',{name:/^OPÇÕES$|^Opções$/i}).first().click();await page.waitForTimeout(1000);
  console.log('options menu buttons',await buttons());
  await shot('options');
  const save=page.getByRole('button',{name:/^(Salvar|Save)$/i});
  if(!(await save.count())){console.log('no save button');process.exitCode=1;}
  else{
    await save.first().click();await page.waitForTimeout(1500);
    await shot('slots');
    await page.getByText(/Slot 1/i).first().click();await page.waitForTimeout(1500);
    const yes=page.getByRole('button',{name:/^(Sim|Confirmar|Sobrescrever)/i});if(await yes.count())await yes.first().click();
    await page.waitForTimeout(3000);
    console.log('3. back from save: intro =',JSON.stringify(await intro()),'screen buttons',await buttons());
    await shot('after-save');
    // Load that save from the title (fresh page load, same profile).
    await continueSlot1();
    const resumed=await page.evaluate(()=>!!window.__emberEngine);
    const r4=await intro();
    console.log('4. after reloading and continuing the save: in battle =',resumed,'intro =',JSON.stringify(r4));
    await shot('after-load');
    // Same campaign, O Vau started fresh (no fight in progress): still never again.
    const seen=await page.evaluate(async u=>{const s=await import(u);const bank=s.loadBank();const rec=s.activeSave(bank);s.writeSlot(bank,0,{...rec,pendingMission:'vau',battle:null});return rec.dialogsSeen;},saveUrl);
    console.log('   dialogsSeen in the save:',JSON.stringify(seen));
    await continueSlot1();
    const fresh=await page.evaluate(()=>!!window.__emberEngine);
    const r5=await intro();
    console.log('5. O Vau started fresh from the same save: in battle =',fresh,'intro =',JSON.stringify(r5));
    await shot('fresh-replay');
    console.log(resumed&&fresh&&r4===null&&r5===null?'PASS: the conversation never repeats':'FAIL');
  }
  console.log('errors',errors.filter(e=>!/Hydration/.test(e)));
}finally{await browser.close();}
