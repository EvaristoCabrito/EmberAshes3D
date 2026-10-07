// O Vau must render as a hexed board (staggered hex edge), not the square-border landscape.
// User's running 8080 server, disposable profile, debug list → mission 01; one screenshot.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/vau-hex-border';
mkdirSync(OUT,{recursive:true});
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
  await page.waitForTimeout(2500);
  await page.screenshot({path:`${OUT}/vau-${Date.now()}.png`});
  console.log('saved');
}finally{await browser.close();}
