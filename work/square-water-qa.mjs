// How water (FX + terrain) meets a straight map border: loads O Vau, flips it to the
// square-border mode in-page (removes "vau" from HEX_BORDER_MISSIONS in this tab only) and
// screenshots both board edges. User's running 8080 server, disposable profile.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/square-water';
mkdirSync(OUT,{recursive:true});
const mode=process.argv[2]??'square';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1920,height:920}});
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:10000});await page.waitForTimeout(2500);};
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  await click('Modo teste');await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista',{exact:true});
  await click(/^01 · /);
  for(let i=0;i<40;i++){
    await page.waitForTimeout(1500);
    const enter=page.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
    const reply=page.locator('.ember-panel button');
    if(await page.evaluate(()=>!!window.__emberEngine)&&await reply.count())await reply.first().click().catch(()=>{});
    if(await page.evaluate(()=>!!window.__emberEngine&&!window.__emberEngine.getHud().pendingDialog))break;
  }
  await page.waitForTimeout(2000);
  if(mode==='square'){
    const url=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/src\/game\/mapFloor\.ts/.test(n)));
    await page.evaluate(async u=>{(await import(u)).HEX_BORDER_MISSIONS.delete('vau');},url);
  }
  if(mode==='water3d'){
    // This tab only: O Vau's river cells become 3D water (waterLevels) and the FX layer is
    // hidden, so the straight-border cut of the 3D water itself is what shows.
    await page.evaluate(()=>{
      const e=window.__emberEngine;
      e.mission.waterLevels=e.tiles.map(t=>t==='water'?0:null);
      for(const c of document.querySelectorAll('canvas'))if(c.style.maskImage||c.style.webkitMaskImage)c.style.visibility='hidden';
    });
  }
  // Keep the AI from moving units over the river while we look.
  await page.evaluate(()=>{const e=window.__emberEngine;e.speedMode='slow';});
  await page.waitForTimeout(2500);
  const stamp=Date.now();
  await page.screenshot({path:`${OUT}/${mode}-full-${stamp}.png`});
  await page.screenshot({path:`${OUT}/${mode}-left-${stamp}.png`,clip:{x:380,y:200,width:420,height:330}});
  await page.screenshot({path:`${OUT}/${mode}-right-${stamp}.png`,clip:{x:1150,y:200,width:420,height:330}});
  console.log('saved',mode,stamp);
}finally{await browser.close();}
