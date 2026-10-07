// Battle log: with the small log open, "Abrir log" shows the whole log full screen; a click
// anywhere on it closes it. User's running 8080 server, disposable profile, mission 01.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/log-fullscreen';
mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1600,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:45000});await page.waitForTimeout(2500);};
const stamp=Date.now();
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  await click('Modo teste');await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista',{exact:true});
  await click(/^01 · /);
  for(let i=0;i<40;i++){
    await page.waitForTimeout(1500);
    const enter=page.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
    const reply=page.locator('.ember-panel button');
    if(await page.evaluate(()=>!!window.__emberEngine)&&await reply.count())await reply.first().click().catch(()=>{});
    if(await page.evaluate(()=>{const e=window.__emberEngine;return !!e&&!e.getHud().pendingDialog&&!!e.selectedId;}))break;
  }
  await page.waitForTimeout(1500);
  // Some lines to show.
  await page.evaluate(()=>{for(let i=1;i<=40;i++)window.__emberEngine.pushLog(`Linha de teste ${i}`);});
  await page.locator('.first-battle-hint, [aria-label="Orientação inicial"] button').first().click().catch(()=>{});
  await page.getByRole('button',{name:'Abrir log de combate'}).click();await page.waitForTimeout(600);
  const openBtn=page.getByRole('button',{name:/^(Abrir log|Open log)$/});
  console.log('Abrir log button visible:',await openBtn.isVisible());
  await openBtn.click();await page.waitForTimeout(800);
  const full=await page.evaluate(()=>{const o=document.querySelector('[data-log-fullscreen]');if(!o)return null;const r=o.getBoundingClientRect();const box=o.firstElementChild;return {w:Math.round(r.width),h:Math.round(r.height),lines:box.querySelectorAll('p').length-1,scrolledToEnd:box.scrollHeight-box.scrollTop-box.clientHeight<4};});
  console.log('full screen log:',JSON.stringify(full));
  await page.screenshot({path:`${OUT}/open-${stamp}.png`});
  await page.mouse.click(800,400);await page.waitForTimeout(500);
  const closed=await page.evaluate(()=>!document.querySelector('[data-log-fullscreen]'));
  console.log('closed after a click:',closed);
  console.log(full&&full.w>=1500&&full.lines>=40&&full.scrolledToEnd&&closed?'PASS':'FAIL');
  console.log('errors',errors.filter(e=>!/Hydration/.test(e)));
}finally{await browser.close();}
