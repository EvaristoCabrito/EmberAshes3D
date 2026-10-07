// Black frames when a battle dialog closes: on the user's running 8080 server (never starts
// one), real game flow in a disposable profile. Captures every compositor frame around the
// close via CDP screencast and reports each frame's mean brightness.
import {chromium} from 'playwright';
import {mkdirSync, writeFileSync} from 'node:fs';
const OUT='screenshots/dialog-close';
mkdirSync(OUT,{recursive:true});
const mission=process.argv[2]??'01';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(`${m.type()}: ${m.text()}`);});
const buttons=async()=>JSON.stringify(await page.getByRole('button').evaluateAll(b=>b.map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().replace(/\s+/g,' ').slice(0,50)).filter(Boolean)));
const cdp=await page.context().newCDPSession(page);
let frames=[];let recording=false;
cdp.on('Page.screencastFrame',async f=>{
  if(recording)frames.push({t:Date.now(),data:f.data});
  await cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});
});
// Mean luminance of each captured frame, measured in a scratch page's 2D canvas.
const scratch=await browser.newPage();
async function luma(b64){
  return scratch.evaluate(async src=>{
    const img=new Image();img.src='data:image/jpeg;base64,'+src;await img.decode();
    const c=document.createElement('canvas');c.width=160;c.height=100;
    const g=c.getContext('2d');g.drawImage(img,0,0,160,100);
    const d=g.getImageData(0,0,160,100).data;let s=0;
    for(let i=0;i<d.length;i+=4)s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];
    return Math.round(s/(d.length/4));
  },b64);
}
async function record(label,action,ms=2500){
  frames=[];recording=true;
  const t0=Date.now();
  await action();
  await page.waitForTimeout(ms);
  recording=false;
  const rows=[];
  for(const [i,f] of frames.entries()){
    const l=await luma(f.data);
    rows.push({i,dt:f.t-t0,l});
    writeFileSync(`${OUT}/${label}-${String(i).padStart(3,'0')}-${f.t-t0}ms-L${l}.jpg`,Buffer.from(f.data,'base64'));
  }
  console.log(label,'frames',rows.length,JSON.stringify(rows.map(r=>`${r.dt}:${r.l}`)));
  const base=rows.length?rows[0].l:0;
  const dark=rows.filter(r=>r.l<base*0.6);
  console.log(label,'baseline',base,'dark frames',JSON.stringify(dark));
}
try{
  await page.goto('http://127.0.0.1:8080/');
  await page.waitForTimeout(6000);
  await page.getByRole('button',{name:'Modo teste'}).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:/^Debug/}).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:/^Classic Tactical/}).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  await page.waitForTimeout(2000);
  await page.getByRole('button',{name:new RegExp(`^${mission} · `)}).click();
  await page.waitForTimeout(2500);
  for(let i=0;i<40;i++){
    await page.waitForTimeout(1500);
    const skip=page.getByRole('button',{name:/^(Pular|Skip)$/i});
    if(await skip.count()) await skip.first().click().catch(()=>{});
    const enter=page.getByRole('button',{name:'Entrar em combate'});
    if(await enter.count()) await enter.click().catch(()=>{});
    if(await page.getByRole('button',{name:/^(Ok|Próximo)$/}).count())break;
  }
  await page.waitForTimeout(3000);
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:60,everyNthFrame:1});
  await page.screenshot({path:`${OUT}/00-dialog-open-m${mission}.png`});
  // Advance through the dialog to its last line, then record the close.
  for(let i=0;i<30;i++){
    const next=page.getByRole('button',{name:'Próximo',exact:true});
    if(!(await next.count()))break;
    await next.click();await page.waitForTimeout(300);
  }
  const ok=page.getByRole('button',{name:'Ok',exact:true});
  if(await ok.count()){
    await record(`m${mission}-close`,()=>ok.click());
  }else{
    const reply=page.locator('.ember-panel button').first();
    if(await reply.count())await record(`m${mission}-reply`,()=>reply.click());
    else console.log('no dialog found',await buttons());
  }
  await page.screenshot({path:`${OUT}/99-after-close-m${mission}.png`});
  console.log('errors',errors);
}finally{await browser.close();}
