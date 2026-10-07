// Neera's bow sound must land its string snap (2.77 s into NeeraBowRelease.mp3) on the frame the
// arrow leaves the bow. Queues one plain Neera ATT shot in a real battle and logs both moments.
// User's running 8080 server, disposable profile, debug list → mission 01.
import {chromium} from 'playwright';
const SNAP=2.77;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11','--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:10000});await page.waitForTimeout(2500);};
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  await click('Modo teste');await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista',{exact:true});
  await click(/^01 · /);
  for(let i=0;i<40;i++){
    await page.waitForTimeout(1500);
    const enter=page.getByRole('button',{name:'Entrar em combate'});if(await enter.count())await enter.click().catch(()=>{});
    const reply=page.locator('.ember-panel button');
    if(await page.evaluate(()=>!!window.__emberEngine)&&await reply.count()){await reply.first().click().catch(()=>{});}
    if(await page.evaluate(()=>!!window.__emberEngine&&!window.__emberEngine.getHud().pendingDialog))break;
  }
  await page.waitForTimeout(3000);
  for(const speed of ['normal','fast','slow']){
    const r=await page.evaluate(async speed=>{
      const e=window.__emberEngine;
      e.speedMode=speed;
      const neera=e.units.find(u=>u.sprite==='neera'&&u.alive);
      const foe=e.units.filter(u=>u.side==='enemy'&&u.alive).sort((a,b)=>Math.hypot(a.x-neera.x,a.y-neera.y)-Math.hypot(b.x-neera.x,b.y-neera.y))[0];
      const log={};
      const origPlay=HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play=function(){if(/NeeraBowRelease/.test(this.src)&&log.play==null){log.play=performance.now();log.startAt=this.currentTime;}return origPlay.call(this);};
      const origFx=e.emitMissileFx;
      e.emitMissileFx=function(...args){if(args[4]==='longShot'&&log.arrow==null)log.arrow=performance.now();return origFx.apply(this,args);};
      log.queued=performance.now();
      e.mode='locked';
      e.queue.push({type:'combat',att:neera.id,def:foe.id,bonusDice:0,bonusDiceCount:0,bonusFlat:0});
      for(let i=0;i<120&&(log.arrow==null||log.play==null);i++)await new Promise(r=>setTimeout(r,50));
      HTMLMediaElement.prototype.play=origPlay;e.emitMissileFx=origFx;
      return {...log,neera:neera.name,foe:foe.name};
    },speed);
    const snapAt=r.play!=null?r.play+(SNAP-(r.startAt??0))*1000:null;
    const off=snapAt!=null&&r.arrow!=null?Math.round(snapAt-r.arrow):null;
    console.log(`${speed}: arrow left ${r.arrow!=null?Math.round(r.arrow-r.queued):'?'} ms after queue; snap at ${snapAt!=null?Math.round(snapAt-r.queued):'?'} ms; snap - arrow = ${off} ms`);
    await page.waitForTimeout(4000);
  }
}finally{await browser.close();}
