import assert from 'node:assert/strict';
// Checks the Party menu's new "Skills" tab on the user's running 8080 server (never starts
// one): mounts the real OverworldMapScreen with some trained skills, opens Party → Skills.
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
      partyLeader:"Neera",heroSkills:{Kael:{poisonResistance:12.3,fireResistance:4},Neera:{poisonResistance:0.4},Voss:{poisonResistance:71}}};
    document.body.style.cssText='margin:0;width:1500px;height:950px;background:black';
    const host=document.createElement('div');host.style.cssText='position:relative;width:1500px;height:950px;overflow:hidden';document.body.append(host);
    (ReactDOM.createRoot??ReactDOM.default.createRoot)(host).render(h(OverworldMapScreen,{locations:WORLD_LOCATIONS,status:()=>'available',missionStatus:()=>'available',ember:0,test:false,muted:true,onMute(){},
      overworldPos:save.overworldPos,gameClock:0,rations:3,hungerStreak:0,heroHunger:{},save,onUseRation(){},onOpenStatus(){},event:null,onDismissEvent(){},onStep(){},onBack(){},onPick(){}}));
  });
  await page.waitForTimeout(2500);

  const marker=page.getByRole('button',{name:'Mover Neera',exact:true}).locator('img');
  const samples=[];
  for(let i=0;i<26;i++){
    await page.waitForTimeout(260);
    samples.push(await marker.evaluate(img=>({src:img.getAttribute('src'),width:img.style.width,height:img.style.height,left:img.style.left,top:img.style.top,loaded:img.complete&&img.naturalWidth===516,crop:img.parentElement.style.cssText})));
  }
  assert.ok(new Set(samples.map(s=>s.src)).size>=10);
  assert.ok(samples.every(s=>s.src.includes('/neera/neera-v2-001/idle-')));
  assert.ok(samples.every(s=>s.loaded));
  assert.equal(new Set(samples.map(({src,loaded,...geometry})=>JSON.stringify(geometry))).size,1);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'screenshots/skills-tab/neera-world-map-fixed.png'});
  console.log('PASS: current Neera animation loads; scale, crop, feet and placement stay fixed across',new Set(samples.map(s=>s.src)).size,'frames');
}finally{await browser.close();}
