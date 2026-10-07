// Black frames anywhere around a battle dialog: records EVERY compositor frame (CDP screencast)
// from the battle appearing, through the dialog opening, each "Próximo", and the close, and
// reports the board region's brightness per frame. User's running 8080 server, disposable
// profile, real game flow (debug list).
import {chromium} from 'playwright';
import {mkdirSync, writeFileSync} from 'node:fs';
const mission=process.argv[2]??'01';
const OUT=`screenshots/dialog-full-m${mission}`;
mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const cdp=await page.context().newCDPSession(page);
const frames=[];const marks=[];let t0=0;
cdp.on('Page.screencastFrame',async f=>{
  frames.push({t:Date.now()-t0,data:f.data});
  await cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});
});
const scratch=await browser.newPage();
// Board region only (centre of the screen, clear of the top bar and bottom HUD).
async function luma(b64){
  return scratch.evaluate(async src=>{
    const img=new Image();img.src='data:image/jpeg;base64,'+src;await img.decode();
    const c=document.createElement('canvas');c.width=150;c.height=80;
    const g=c.getContext('2d');
    g.drawImage(img,img.width*0.2,img.height*0.1,img.width*0.6,img.height*0.55,0,0,150,80);
    const d=g.getImageData(0,0,150,80).data;let s=0;
    for(let i=0;i<d.length;i+=4)s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];
    return Math.round(s/(d.length/4));
  },b64);
}
const click=async(name,opts={})=>{const b=page.getByRole('button',{name,...opts});await b.first().click({timeout:10000});await page.waitForTimeout(2500);};
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  if(process.argv[3]==='campaign'){
    // Real campaign (not test mode): a save slot sitting at this mission's briefing, entered
    // through Continuar → slot, so every save write the real game does on a reply happens.
    const saveUrl=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/src\/game\/save\.ts/.test(n)));
    await page.evaluate(async ({u,id})=>{const s=await import(u);const bank=s.loadBank();s.writeSlot(bank,0,{...s.activeSave(bank),pendingMission:id,battle:null});},{u:saveUrl,id:process.argv[4]??'vau'});
    await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
    const cont=page.getByRole('button',{name:/^(Continuar|Continue)/i});
    for(let i=0;i<60&&!(await cont.first().isEnabled());i++)await page.waitForTimeout(1000);
    await cont.first().click();await page.waitForTimeout(1500);
    await page.getByText(/Slot 1/i).first().click();await page.waitForTimeout(1500);
  }else{
    await click('Modo teste');await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista',{exact:true});
    await click(new RegExp(`^${mission} · `));
  }
  t0=Date.now();
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:60,everyNthFrame:1});
  marks.push({t:0,what:'mission clicked'});
  let dialogSeen=false;
  for(let i=0;i<60;i++){
    await page.waitForTimeout(500);
    const skip=page.getByRole('button',{name:/^(Pular|Skip)$/i});
    if(await skip.count()){await skip.first().click().catch(()=>{});marks.push({t:Date.now()-t0,what:'skip'});}
    const enter=page.getByRole('button',{name:'Entrar em combate'});
    if(await enter.count()){await enter.click().catch(()=>{});marks.push({t:Date.now()-t0,what:'enter combat'});}
    if(await page.getByRole('button',{name:/^(Ok|Próximo)$/}).count()){dialogSeen=true;marks.push({t:Date.now()-t0,what:'dialog visible'});break;}
  }
  if(!dialogSeen)console.log('no dialog appeared');
  await page.waitForTimeout(1500);
  for(let i=0;i<30;i++){
    const next=page.getByRole('button',{name:'Próximo',exact:true});
    if(!(await next.count()))break;
    marks.push({t:Date.now()-t0,what:`próximo ${i+1}`});
    await next.click();await page.waitForTimeout(900);
  }
  const ok=page.getByRole('button',{name:'Ok',exact:true});
  const reply=page.locator('.ember-panel button');
  if(await ok.count()){marks.push({t:Date.now()-t0,what:'ok (close)'});await ok.click();}
  else if(await reply.count()){marks.push({t:Date.now()-t0,what:'reply (close)'});await reply.first().click();}
  await page.waitForTimeout(3000);
  await cdp.send('Page.stopScreencast');
  const rows=[];
  for(const [i,f] of frames.entries())rows.push({i,t:f.t,l:await luma(f.data)});
  // Steady-state brightness of the board once the battle is up: median of the last second.
  const tail=rows.filter(r=>r.t>rows.at(-1).t-1000).map(r=>r.l).sort((a,b)=>a-b);
  const steady=tail[Math.floor(tail.length/2)]??0;
  const battleStart=rows.find(r=>r.l>steady*0.6)?.t??0;
  const dark=rows.filter(r=>r.t>battleStart&&r.l<steady*0.6);
  for(const r of dark)writeFileSync(`${OUT}/dark-${String(r.i).padStart(4,'0')}-${r.t}ms-L${r.l}.jpg`,Buffer.from(frames[r.i].data,'base64'));
  console.log('marks',JSON.stringify(marks));
  console.log('frames',rows.length,'steady board brightness',steady,'battle visible from',battleStart,'ms');
  console.log('dark frames after battle visible',JSON.stringify(dark.map(r=>`${r.t}ms:L${r.l}`)));
  console.log('timeline',JSON.stringify(rows.filter((r,k)=>k%3===0||dark.includes(r)).map(r=>`${r.t}:${r.l}`)));
  console.log('errors',errors.filter(e=>!/Hydration/.test(e)));
}finally{await browser.close();}
