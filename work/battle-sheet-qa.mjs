// Battle status sheet (spell tiers) and battle log scrolling, on the user's running 8080
// server (never starts one), driven through the real game flow in a disposable profile.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('screenshots/battle-sheet',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const step=process.argv[2]??'explore';
try{
  await page.goto('http://127.0.0.1:8080/');
  await page.waitForTimeout(6000);
  if(step==='explore'){
    console.log(JSON.stringify(await page.getByRole('button').evaluateAll(b=>b.map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,40)).filter(Boolean))));
    await page.screenshot({path:'screenshots/battle-sheet/00-title.png'});
  }
  console.log('errors',errors);
}finally{await browser.close();}
