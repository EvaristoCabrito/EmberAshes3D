// Checks world-map poison and the party panel's life bars on the user's running 8080 server
// (never starts one): steps a poisoned party with the real stepOverworld, then mounts the real
// OverworldMapScreen and screenshots the party panel.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('screenshots/life-bar',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__life-qa',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
try{
  await page.goto('http://127.0.0.1:8080/__life-qa');
  const steps=await page.evaluate(async()=>{
    const {stepOverworld,neighborsOf}=await import('/src/game/overworld.ts');
    const {emptySave}=await import('/src/game/save.ts');
    const {WORLD_LOCATIONS}=await import('/src/game/data.ts');
    let s={...emptySave(),flags:['recruited:Neera','recruited:Voss','recruited:Salazar'],completed:['vau','bosque','aldeia','thebridge'],
      unitHp:{Kael:20,Neera:14,Voss:3,Salazar:20},heroPoisons:{Neera:10,Voss:4,Salazar:true},heroDiseases:{Salazar:true},rations:20};
    const log=[];
    for(let i=0;i<6;i++){
      const here=s.overworldPos;const opts=neighborsOf?neighborsOf(here.col,here.row):[];
      let moved=false;
      for(const n of opts){const r=stepOverworld(s,n.x??n.col,n.y??n.row,WORLD_LOCATIONS,true);if(r.save!==s){s=r.save;moved=true;break;}}
      log.push({moved,hp:{...s.unitHp}});
      if(!moved)break;
    }
    window.__save=s;return log;
  });
  console.log(JSON.stringify(steps));
  await page.evaluate(async()=>{
    const refresh=await import('/@react-refresh');refresh.default.injectIntoGlobalHook(window);
    window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
    const React=await import('/node_modules/.vite/deps/react.js');
    const ReactDOM=await import('/node_modules/.vite/deps/react-dom_client.js');
    const {OverworldMapScreen}=await import('/src/game/OverworldMapScreen.tsx');
    const {WORLD_LOCATIONS}=await import('/src/game/data.ts');
    await import('/src/styles.css');
    const h=React.createElement??React.default.createElement;
    const save={...window.__save,unitHp:{Kael:20,Neera:14,Voss:3,Salazar:20}};
    document.body.style.cssText='margin:0;width:1500px;height:950px;background:black';
    const host=document.createElement('div');host.style.cssText='position:relative;width:1500px;height:950px;overflow:hidden';document.body.append(host);
    (ReactDOM.createRoot??ReactDOM.default.createRoot)(host).render(h(OverworldMapScreen,{locations:WORLD_LOCATIONS,status:()=>'available',missionStatus:()=>'available',ember:0,test:false,muted:true,onMute(){},
      overworldPos:save.overworldPos,gameClock:0,rations:3,hungerStreak:0,heroHunger:{},save,onUseRation(){},onOpenStatus(){},event:null,onDismissEvent(){},onStep(){},onBack(){},onPick(){}}));
  });
  await page.waitForTimeout(2500);
  const bars=await page.locator('.life-bar').evaluateAll(b=>b.map(x=>[x.getAttribute('aria-label'),x.className,x.title,getComputedStyle(x.firstElementChild).backgroundImage!=='none'?getComputedStyle(x.firstElementChild).backgroundImage.slice(0,60):getComputedStyle(x.firstElementChild).backgroundColor]));
  console.log(JSON.stringify(bars,null,1));
  const panel=await page.locator('.map-party-panel').boundingBox();
  await page.screenshot({path:'screenshots/life-bar/party-panel.png',clip:{x:panel.x,y:panel.y,width:panel.width,height:panel.height}});
  console.log('errors',errors);
}finally{await browser.close();}
