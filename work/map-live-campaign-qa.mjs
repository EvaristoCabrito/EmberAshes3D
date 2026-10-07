// Map Editor changes must reach the campaign with no reload and no restart:
//  1. cross-tab: a map override made in one tab is live in another open tab instantly;
//  2. resume: a fight saved on an older version of a map does not paint the old board back.
// Runs on the user's running 8080 server (never starts one), disposable profile, and never
// writes a map file.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/map-live-campaign';
mkdirSync(OUT,{recursive:true});
const BASE='http://127.0.0.1:8080/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const ctx=await browser.newContext({viewport:{width:1500,height:950}});
const errors=[];
const open=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(BASE);await p.waitForTimeout(6000);return p;};
const buttons=async p=>JSON.stringify(await p.getByRole('button').evaluateAll(b=>b.map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().replace(/\s+/g,' ').slice(0,40)).filter(Boolean)));
// The app's own mapstore instance: import the exact URL the page itself loaded.
const mapstore=p=>p.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/src\/game\/mapstore\.ts/.test(n)));
let pass=true;
try{
  // ---- 1. cross-tab ----
  const a=await open(), b=await open();
  const urlA=await mapstore(a), urlB=await mapstore(b);
  console.log('mapstore urls',urlA,urlB);
  const before=await b.evaluate(async u=>(await import(u)).missionById('vau')?.title,urlB);
  await a.evaluate(async u=>{const m=await import(u);m.registerSessionMapOverride({...m.latestSavedDraft('vau'),title:'QA LIVE TITLE'});},urlA);
  await b.waitForTimeout(500);
  const after=await b.evaluate(async u=>(await import(u)).missionById('vau')?.title,urlB);
  console.log('tab B vau title before',JSON.stringify(before),'after tab A override',JSON.stringify(after));
  if(after!=='QA LIVE TITLE'){pass=false;console.log('FAIL cross-tab');}
  await a.evaluate(async u=>(await import(u)).clearSessionMapOverride('vau'),urlA);
  await b.waitForTimeout(500);
  const cleared=await b.evaluate(async u=>(await import(u)).missionById('vau')?.title,urlB);
  console.log('tab B after clear',JSON.stringify(cleared));
  if(cleared!==before){pass=false;console.log('FAIL cross-tab clear');}
  await a.close();await b.close();

  // ---- 2. resume vs edited map ----
  const p=await open();
  const click=async(name,opts={})=>{
    const btn=p.getByRole('button',{name,...opts});
    try{await btn.first().click({timeout:8000});}
    catch(e){console.log('could not click',String(name),await buttons(p));await p.screenshot({path:`${OUT}/stuck.png`});throw e;}
    await p.waitForTimeout(2500);
  };
  await click('Modo teste');
  await click(/^Debug/);
  await click(/^Classic Tactical/);
  await click('Lista',{exact:true});
  await click(/^01 · /);
  for(let i=0;i<40;i++){
    await p.waitForTimeout(1500);
    const skip=p.getByRole('button',{name:/^(Pular|Skip)$/i});if(await skip.count())await skip.first().click().catch(()=>{});
    const enter=p.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
    if(await p.evaluate(()=>!!window.__emberEngine))break;
  }
  await p.waitForTimeout(2000);
  if(!(await p.evaluate(()=>!!window.__emberEngine))){
    console.log('no battle engine yet',await buttons(p));
    await p.screenshot({path:`${OUT}/no-engine.png`});
    throw new Error('battle did not start');
  }
  const base=await p.evaluate(()=>{const e=window.__emberEngine;return {id:e.mission.id,mapKey:e.mapKey,decor:e.decorations.length,snap:e.captureSnapshot()};});
  console.log('fresh battle',base.id,'mapKey',base.mapKey,'decorations',base.decor);
  if(!base.mapKey){pass=false;console.log('FAIL engine has no mapKey');}
  const saveUrl=await p.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/src\/game\/save\.ts/.test(n)));
  for(const [label,mapKey,expectResumed] of [['same map',base.mapKey,true],['edited map',`${base.mapKey}-stale`,false],['pre-fingerprint save',undefined,false]]){
    // An "old board": same fight, but every decoration stripped.
    const snap={...base.snap,decorations:[],mapKey};
    await p.evaluate(async ({u,snap,id})=>{const s=await import(u);const bank=s.loadBank();s.writeSlot(bank,0,{...s.activeSave(bank),completed:[],pendingMission:id,battle:snap});},{u:saveUrl,snap,id:base.id});
    await p.goto(BASE);await p.waitForTimeout(6000);
    const cont=p.getByRole('button',{name:/^(Continuar|Continue)/i});
    if(!(await cont.count())){console.log(label,'no continue button',await buttons(p));pass=false;continue;}
    // Continuar stays disabled until the title's art load finishes.
    for(let i=0;i<60&&!(await cont.first().isEnabled());i++)await p.waitForTimeout(1000);
    await cont.first().click();
    // Continuar opens the slot picker; the doctored save sits in slot 1.
    await p.waitForTimeout(1500);
    const slot=p.getByRole('button',{name:/Slot 1/i});
    if(await slot.count())await slot.first().click();
    else await p.getByText('Em combate').first().click();
    for(let i=0;i<40;i++){
      await p.waitForTimeout(1500);
      const skip=p.getByRole('button',{name:/^(Pular|Skip)$/i});if(await skip.count())await skip.first().click().catch(()=>{});
      const enter=p.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
      if(await p.evaluate(()=>!!window.__emberEngine))break;
    }
    await p.waitForTimeout(2000);
    const got=await p.evaluate(()=>{const e=window.__emberEngine;return e?{decor:e.decorations.length,mapKey:e.mapKey}:null;});
    const resumed=got?.decor===0;
    console.log(label,JSON.stringify(got),resumed?'RESUMED old fight':'FRESH on current map',resumed===expectResumed?'ok':'WRONG');
    if(resumed!==expectResumed)pass=false;
    await p.screenshot({path:`${OUT}/resume-${label.replace(/\W+/g,'-')}.png`});
  }
  console.log(pass?'PASS':'FAIL');
  console.log('errors',errors);
}finally{await browser.close();}
