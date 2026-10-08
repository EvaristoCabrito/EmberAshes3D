// Real game flow on the user's running 8080 server (never starts one): title -> Modo teste ->
// Debug (goToMap), then samples every frame what the loading layers show: the screen-change
// curtain (z-80, "Preparando a tela") and the map overlay (z-70, "Carregando o mapa").
// Arg 1: tag; arg 2: "slow" to throttle the network after the title has loaded.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('screenshots/world-map-loading',{recursive:true});
const tag=process.argv[2]??'ingame';
const slow=process.argv[3]==='slow';
const choice=process.argv[4]??'RPG Map';
const browser=await chromium.launch({channel:"msedge",headless:true,args:['--no-sandbox','--use-angle=d3d11','--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto('http://127.0.0.1:8080/');
  await page.getByText('Modo teste',{exact:true}).first().waitFor({timeout:120000});
  // Title art preload must finish before the menu buttons enable.
  await page.waitForFunction(()=>![...document.querySelectorAll('button')].some(b=>/Modo teste/.test(b.textContent)&&b.disabled),null,{timeout:180000});
  await page.getByText('Modo teste',{exact:true}).first().click();
  const debugBtn=page.getByRole('button',{name:/Debug/});
  await debugBtn.waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>/^Debug/.test(b.textContent.trim())&&!b.disabled),null,{timeout:180000});
  if(slow){
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:(8*1024*1024)/8,uploadThroughput:-1});
  }
  await page.locator('button',{hasText:/^Debug/}).first().click();
  await page.getByText(choice,{exact:true}).waitFor();
  await page.evaluate(()=>{
    window.__xhr=[];const open=XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open=function(m,u,...rest){if(/world-map\.jpg/.test(u)){const t0=performance.now();for(const ev of ['loadstart','progress','load','error','abort'])this.addEventListener(ev,e=>window.__xhr.push(`${Math.round(performance.now()-window.__t0)}ms ${ev} ${e.lengthComputable?e.loaded+'/'+e.total:'?'} status=${this.status} dom=${[...document.querySelectorAll('[role=progressbar]')].filter(b=>/Carregando o mapa/.test(b.getAttribute('aria-label')||'')).map(b=>b.getAttribute('aria-valuenow')).join(',')} vis=${document.visibilityState}`));}return open.call(this,m,u,...rest);};
    performance.clearResourceTimings();performance.setResourceTimingBufferSize(20000);
    window.__wm=[];let last='';const t0=performance.now();window.__t0=t0;
    const tick=()=>{
      const bars=[...document.querySelectorAll('[role=progressbar]')].filter(b=>/Carregando o mapa|Preparando/.test(b.getAttribute('aria-label')||''));
      const key=bars.map(b=>`${b.getAttribute('aria-label')}=${b.getAttribute('aria-valuenow')??'null'}/${b.firstElementChild?.style.width??'nofill'}`).join(' + ')||'(no bar)';
      if(key!==last){window.__wm.push(`${Math.round(performance.now()-t0)}ms ${key}`);last=key;}
      if(performance.now()-t0<15000)requestAnimationFrame(tick);
    };requestAnimationFrame(tick);
  });
  await page.getByText(choice,{exact:true}).click();
  await page.waitForTimeout(15500);
  const log=await page.evaluate(()=>window.__wm);
  console.log(`[${tag}${slow?' slow':''}]`);for(const l of log)console.log('  ',l);
  const res=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.startTime>=window.__t0)
    .map(e=>`${Math.round(e.startTime-window.__t0)}->${Math.round(e.responseEnd-window.__t0)}ms ${e.transferSize}B ${e.name.replace(location.origin,'').slice(0,100)}`));
  const xhr=await page.evaluate(()=>window.__xhr);console.log('map xhr events:',xhr.length);for(const x of xhr.filter((x,i)=>i<6||i>xhr.length-6))console.log('    ',x);
  console.log('requests after click:',res.length);for(const r of res.slice(0,60))console.log('    ',r);
  console.log('errors:',errors);
  await page.screenshot({path:`screenshots/world-map-loading/${tag}${slow?'-slow':''}-end.png`});
}finally{await browser.close();}


