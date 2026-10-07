// Does a soldier standing NEXT to the end of O Vau's barricade row (7..9, 8) look like it is
// standing ON the barricade, two hexes from Kael? Places units via the engine, screenshots,
// and prints each pair's real hex distance. User's running 8080 server, disposable profile.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const OUT='screenshots/barricade-adjacency';
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
  await page.waitForTimeout(2000);
  // Each case: [soldier cell, Kael cell]. Barricades sit at (7,8) (8,8) (9,8).
  for(const [label,s,k] of [['soldier-10-8_kael-9-9',[10,8],[9,9]],['soldier-10-8_kael-10-9',[10,8],[10,9]],['soldier-8-7_kael-8-9-NOT-adjacent',[8,7],[8,9]]]){
    const info=await page.evaluate(({s,k})=>{
      const e=window.__emberEngine;
      const put=(u,[x,y])=>{u.x=x;u.y=y;u.drawX=x;u.drawY=y;};
      const kael=e.units.find(u=>u.name==='Kael');
      const soldier=e.units.find(u=>u.classId==='soldier'&&u.alive);
      // Park everyone else away from the scene so nothing hides it.
      put(kael,k);put(soldier,s);
      e.invalidateOcc?.();
      e.ensureVisible(k[0],k[1]);
      const odd=r=>r&1;const cube=(c,r)=>{const q=c-(r-odd(r))/2;return [q,r,-q-r];};
      const [a,b]=[cube(...s),cube(...k)];
      const dist=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]),Math.abs(a[2]-b[2]));
      return {soldier:soldier.name,dist,barricades:e.decorations.filter(d=>d.id==='barricade').map(d=>[d.x,d.y])};
    },{s,k});
    await page.waitForTimeout(1500);
    await page.screenshot({path:`${OUT}/${label}.png`});
    console.log(label,JSON.stringify(info));
  }
}finally{await browser.close();}
