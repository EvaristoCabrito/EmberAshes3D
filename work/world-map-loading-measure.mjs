// Measures what the world-map loading bar reports vs. what actually finishes loading, on the
// user's running 8080 server (never starts one). Mounts the real OverworldMapScreen, throttles
// the network so the timeline is visible, samples the bar every frame, and lists every image
// that finished AFTER the bar disappeared.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('screenshots/world-map-loading',{recursive:true});
const tag=process.argv[2]??'before';
const browser=await chromium.launch({channel:"msedge",headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__wm-loading-qa',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
try{
  await page.goto('http://127.0.0.1:8080/__wm-loading-qa');
  // Warm Vite's module graph first so only the map's own art is measured.
  await page.evaluate(async()=>{
    const refresh=await import('/@react-refresh');refresh.default.injectIntoGlobalHook(window);
    window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
    await import('/node_modules/.vite/deps/react.js');await import('/node_modules/.vite/deps/react-dom_client.js');
    await import('/src/game/OverworldMapScreen.tsx');await import('/src/game/data.ts');await import('/src/game/save.ts');await import('/src/styles.css');
  });
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:(8*1024*1024)/8,uploadThroughput:-1});
  const result=await page.evaluate(async()=>{
    const React=await import('/node_modules/.vite/deps/react.js');
    const ReactDOM=await import('/node_modules/.vite/deps/react-dom_client.js');
    const {OverworldMapScreen}=await import('/src/game/OverworldMapScreen.tsx');
    const {WORLD_LOCATIONS}=await import('/src/game/data.ts');
    const {emptySave}=await import('/src/game/save.ts');
    const h=React.createElement??React.default.createElement;
    const save={...emptySave(),flags:['recruited:Neera','recruited:Voss','recruited:Salazar'],completed:['vau','bosque','aldeia','thebridge']};
    document.body.style.cssText='margin:0;width:1500px;height:950px;background:black';
    const host=document.createElement('div');host.style.cssText='position:relative;width:1500px;height:950px;overflow:hidden';document.body.append(host);
    performance.clearResourceTimings();performance.setResourceTimingBufferSize(20000);
    const t0=performance.now();
    const samples=[];let hiddenAt=null;let last;
    (ReactDOM.createRoot??ReactDOM.default.createRoot)(host).render(h(OverworldMapScreen,{locations:WORLD_LOCATIONS,status:()=>'available',missionStatus:()=>'available',ember:0,test:false,muted:true,onMute(){},
      overworldPos:save.overworldPos,gameClock:0,rations:3,hungerStreak:0,heroHunger:{},save,onUseRation(){},onOpenStatus(){},event:null,onDismissEvent(){},onStep(){},onBack(){},onPick(){}}));
    await new Promise(done=>{
      const tick=()=>{
        const bar=host.querySelector('[role=progressbar][aria-label="Carregando o mapa"]');
        const now=Math.round(performance.now()-t0);
        if(bar){const v=bar.getAttribute('aria-valuenow');const fill=bar.firstElementChild?.style.width??'none';const key=v+'|'+fill;if(key!==last){samples.push({t:now,valuenow:v,fill});last=key;}}
        else if(hiddenAt===null&&samples.length){hiddenAt=now;}
        if(hiddenAt!==null&&now>hiddenAt+3000)return done();
        if(now>60000)return done();
        requestAnimationFrame(tick);
      };tick();
    });
    const res=performance.getEntriesByType('resource').filter(e=>e.startTime>=t0&&/\.(png|jpe?g|webp)(\?|$)/.test(e.name))
      .map(e=>({url:e.name.replace(location.origin,''),start:Math.round(e.startTime-t0),end:Math.round(e.responseEnd-t0),bytes:e.transferSize||e.encodedBodySize}));
    const imgs=[...host.querySelectorAll('img')].map(i=>({src:(i.currentSrc||i.src).replace(location.origin,'').slice(0,90),done:i.complete&&i.naturalWidth>0}));
    return {hiddenAt,samples,res,imgs};
  });
  console.log(`[${tag}] bar hidden at ${result.hiddenAt} ms`);
  console.log('bar timeline:',result.samples.map(s=>`${s.t}ms=${s.valuenow??'null'}/${s.fill}`).join('  '));
  const after=result.res.filter(r=>r.end>result.hiddenAt);
  const before=result.res.filter(r=>r.end<=result.hiddenAt);
  console.log(`images finished while the bar was up: ${before.length} (${before.reduce((a,r)=>a+r.bytes,0)} B)`);
  console.log(`images finished AFTER the bar was gone: ${after.length} (${after.reduce((a,r)=>a+r.bytes,0)} B)`);
  for(const r of before)console.log('  up:',r.start,'->',r.end,'ms',r.bytes,'B',r.url);
  for(const r of after.slice(0,40))console.log('  ',r.end,'ms',r.bytes,'B',r.url);
  console.log('imgs in DOM:',result.imgs.length,'not decoded:',result.imgs.filter(i=>!i.done).map(i=>i.src));
  console.log('errors:',errors);
  await page.screenshot({path:`screenshots/world-map-loading/${tag}-end.png`});
}finally{await browser.close();}

