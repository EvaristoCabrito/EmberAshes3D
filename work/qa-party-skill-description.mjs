import assert from 'node:assert/strict';
// Checks the Party menu's new "Skills" tab on the user's running 8080 server (never starts
// one): mounts the real OverworldMapScreen with some trained skills, opens Party â†’ Skills.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('screenshots/skills-tab',{recursive:true});
const browser=await chromium.launch({channel:"msedge",headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__skills-qa',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
try{
  await page.goto('http://127.0.0.1:8080/__skills-qa');
  await page.evaluate(async()=>{
    const refresh=await import('/@react-refresh');refresh.default.injectIntoGlobalHook(window);
    window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
    const React=await import('/node_modules/.vite/deps/react.js');
    const ReactDOM=await import('/node_modules/.vite/deps/react-dom_client.js');
    const {OverworldMapScreen}=await import('/src/game/OverworldMapScreen.tsx');
    const {WORLD_LOCATIONS}=await import('/src/game/data.ts');
    const {emptySave}=await import('/src/game/save.ts');
    await import('/src/styles.css');
    const h=React.createElement??React.default.createElement;
    const save={...emptySave(),flags:['recruited:Neera','recruited:Voss','recruited:Salazar'],completed:['vau','bosque','aldeia','thebridge'],
      heroSkills:{Kael:{poisonResistance:12.3,fireResistance:4},Neera:{poisonResistance:0.4},Voss:{poisonResistance:71}}};
    document.body.style.cssText='margin:0;width:1500px;height:950px;background:black';
    const host=document.createElement('div');host.style.cssText='position:relative;width:1500px;height:950px;overflow:hidden';document.body.append(host);
    (ReactDOM.createRoot??ReactDOM.default.createRoot)(host).render(h(OverworldMapScreen,{locations:WORLD_LOCATIONS,status:()=>'available',missionStatus:()=>'available',ember:0,test:false,muted:true,onMute(){},
      overworldPos:save.overworldPos,gameClock:0,rations:3,hungerStreak:0,heroHunger:{},save,onUseRation(){},onOpenStatus(){},event:null,onDismissEvent(){},onStep(){},onBack(){},onPick(){}}));
  });
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:'Party',exact:true}).click();
  await page.waitForTimeout(400);
  const dialog=page.getByRole('dialog');
  await dialog.screenshot({path:'screenshots/skills-tab/05-party-grupo-tab-reordered.png'});
  console.log('grupo tab sections',await dialog.locator('section[aria-label]').evaluateAll(s=>s.map(x=>x.getAttribute('aria-label'))));
  await page.getByRole('tab',{name:'Skills'}).click();
  await page.waitForTimeout(300);
  await dialog.screenshot({path:'screenshots/skills-tab/06-party-skills-tab-reordered.png'});
  console.log('skill rows',JSON.stringify(await dialog.locator('[role=progressbar]').evaluateAll(b=>b.map(x=>[x.getAttribute('aria-label'),x.getAttribute('aria-valuenow')]))));
  const text=await dialog.innerText();
  assert.ok(text.includes('de arma podem ganhar +0,1 por tentativa'));
  assert.ok(text.includes('Healing pode ganhar +0,1'));
  assert.ok(text.includes('+11,4%'));
  assert.ok(text.includes('a cada 12h de viagem'));
  assert.deepEqual(errors,[]);
  console.log('PASS: corrected weapon, Healing and road training explanations in world map Party menu');
}finally{await browser.close();}