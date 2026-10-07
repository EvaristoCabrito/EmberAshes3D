// Battle status sheet (spell tiers) and battle log scrolling, on the user's running 8080
// server (never starts one), driven through the real game flow in a disposable profile.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('screenshots/battle-sheet',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const buttons=async()=>JSON.stringify(await page.getByRole('button').evaluateAll(b=>b.map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().replace(/\s+/g,' ').slice(0,50)).filter(Boolean)));
const step=process.argv[2]??'test';
async function magias(){
  for(let i=0;i<6;i++){
    const btn=page.getByRole('button',{name:'Magias fora da barra'});
    if(await btn.count() && await btn.isEnabled()){
      await btn.click();await page.waitForTimeout(500);
      const rows=await page.getByRole('menuitem').evaluateAll(b=>b.map(x=>x.textContent.trim()));
      console.log('magias menu rows',JSON.stringify(rows));
      await page.screenshot({path:'screenshots/battle-sheet/09-magias-menu.png'});
      return;
    }
    const wait=page.getByRole('button',{name:'Esperar',exact:true});
    if(await wait.count() && await wait.isEnabled()) await wait.click();
    await page.waitForTimeout(2500);
  }
  console.log('no unit with spells outside the hotbar this run');
}
async function battle(){
  await page.getByRole('button',{name:/^03 · /}).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button',{name:'Entrar em combate'}).click();
  // Intro video / loading curtain: skip if offered, then wait for the battle HUD.
  for(let i=0;i<40;i++){
    await page.waitForTimeout(1500);
    const skip=page.getByRole('button',{name:/Pular|Skip/i});
    if(await skip.count()) await skip.first().click().catch(()=>{});
    if(await page.getByRole('button',{name:'Abrir status e equipamento'}).count()) break;
  }
  await page.waitForTimeout(2000);
  if(!(await page.getByRole('button',{name:'Abrir status e equipamento'}).count())){
    console.log('no battle HUD yet',await buttons());
    await page.screenshot({path:'screenshots/battle-sheet/05-no-hud.png'});
    return;
  }
  if(step==='magias'){await magias();return;}
  if(step==='sheets'){
    // Every unit's sheet: one screenshot per hero, and each spell row's layout (tier pinned right).
    await page.getByRole('button',{name:'Abrir status e equipamento'}).first().click();
    await page.waitForTimeout(800);
    const seen=new Set();
    for(let i=0;i<24;i++){
      const info=await page.evaluate(()=>{
        const panel=document.querySelector('.status-panel');
        const name=panel?.querySelector('h2,h3,.font-display')?.textContent?.trim()??'?';
        const rows=[...(panel?.querySelectorAll('span.ml-auto.shrink-0')??[])].map(s=>{
          const row=s.parentElement.getBoundingClientRect(),r=s.getBoundingClientRect();
          return {text:s.textContent.trim(),rightGap:Math.round(row.right-r.right)};
        });
        const inline=[...(panel?.querySelectorAll('p span.tabular-nums')??[])].filter(s=>/Tier/.test(s.textContent)).length;
        return {name,rows,inline};
      });
      if(seen.has(info.name)){await page.getByRole('button',{name:'Próximo personagem'}).click();await page.waitForTimeout(400);continue;}seen.add(info.name);
      console.log(JSON.stringify(info));
      await page.screenshot({path:`screenshots/battle-sheet/10-sheet-${i}-${info.name.replace(/\W+/g,'_')}.png`});
      await page.getByRole('button',{name:'Próximo personagem'}).click();await page.waitForTimeout(500);
    }
    return;
  }
  // Status sheet: spell list with tiers, no weapon-skill / resistance tables.
  await page.getByRole('button',{name:'Abrir status e equipamento'}).first().click();
  await page.waitForTimeout(800);
  const sheet=await page.evaluate(()=>{
    const t=document.body.innerText;
    return {weaponSkills:t.includes('Weapon Skills'),elemental:t.includes('Elemental Resistances'),
      spellRows:[...document.querySelectorAll('p')].map(p=>p.textContent.trim()).filter(s=>/Tier \d+ · ×/.test(s)).slice(0,12)};
  });
  console.log('sheet',JSON.stringify(sheet,null,1));
  await page.screenshot({path:'screenshots/battle-sheet/06d-status-sheet-spell-tiers.png'});
  // Cycle to other heroes so each class's spell list gets a look.
  for(let i=0;i<3;i++){
    const next=page.getByRole('button',{name:/Próxim|seguinte|›|Next/i});
    if(!(await next.count()))break;
    await next.first().click();await page.waitForTimeout(500);
    const rows=await page.evaluate(()=>[...document.querySelectorAll('p')].map(p=>p.textContent.trim()).filter(s=>/Tier \d+ · ×/.test(s)));
    console.log('next unit rows',JSON.stringify(rows));
    await page.screenshot({path:`screenshots/battle-sheet/07d-status-sheet-unit-${i+2}.png`});
  }
  // Close the sheet by clicking its veil, outside the panel.
  await page.mouse.click(120,500);
  await page.waitForTimeout(600);
  // Give the log enough lines to scroll: end a few rounds so the enemies act and log.
  for(let r=0;r<4;r++){
    const end=page.getByRole('button',{name:/Fim do turno/i});
    if(await end.count()) await end.first().click().catch(()=>{});
    await page.waitForTimeout(800);
    const confirm=page.getByRole('button',{name:/^(Confirmar|Sim|Encerrar|Fim do turno)$/i});
    if(await confirm.count()>1) await confirm.last().click().catch(()=>{});
    for(let w=0;w<20;w++){await page.waitForTimeout(1000);if(await page.getByRole('button',{name:'Abrir log de combate'}).count())break;}
  }
  await page.waitForTimeout(1000);
  // Test-only: reach the BattleEngine through React's fiber and add 30 log lines.
  const pushed=await page.evaluate(()=>{
    const el=document.querySelector('[aria-label="Abrir log de combate"]');
    const key=el&&Object.keys(el).find(k=>k.startsWith('__reactFiber'));
    for(let f=key?el[key]:null;f;f=f.return){
      const eng=f.memoizedProps?.engine;
      if(eng&&typeof eng.pushLog==='function'){for(let i=1;i<=30;i++)eng.pushLog(`QA linha ${i}`);return true;}
    }
    return false;
  });
  console.log('qa lines pushed:',pushed);
  await page.waitForTimeout(800);
  // Battle log: open, fill with lines, scroll up, add a line, check it stays where the reader left it.
  await page.getByRole('button',{name:'Abrir log de combate'}).click();
  await page.waitForTimeout(500);
  const log=page.locator('div.overflow-y-auto.ember-scrollbar').first();
  const info=async()=>log.evaluate(el=>({top:Math.round(el.scrollTop),height:el.scrollHeight,client:el.clientHeight,lines:el.children.length}));
  console.log('log opened',JSON.stringify(await info()));
  const box=await log.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.wheel(0,-400);await page.waitForTimeout(400);
  const afterWheel=await info();
  console.log('after wheel up',JSON.stringify(afterWheel));
  console.log('log still open after wheel:',await page.getByRole('button',{name:'Fechar log e ver status'}).count()>0);
  await page.screenshot({path:'screenshots/battle-sheet/08d-log-scrolled-up.png'});
  // A new line while scrolled up must not yank the reader back to the bottom.
  await page.evaluate(()=>{
    const el=document.querySelector('[aria-label="Fechar log e ver status"]');
    const key=Object.keys(el).find(k=>k.startsWith('__reactFiber'));
    for(let f=el[key];f;f=f.return){const eng=f.memoizedProps?.engine;if(eng?.pushLog){eng.pushLog('QA linha nova');return;}}
  });
  await page.waitForTimeout(800);
  console.log('after new line while scrolled up',JSON.stringify(await info()));
}
try{
  await page.goto('http://127.0.0.1:8080/');
  await page.waitForTimeout(6000);
  await page.getByRole('button',{name:'Modo teste'}).click();
  await page.waitForTimeout(2500);
  if(step==='test'){
    console.log(await buttons());
    await page.screenshot({path:'screenshots/battle-sheet/01-test-menu.png'});
  }
  if(step!=='test'){
    await page.getByRole('button',{name:/^Debug/}).click();
    await page.waitForTimeout(2500);
    if(step==='debug'){console.log(await buttons());await page.screenshot({path:'screenshots/battle-sheet/02-debug.png'});}
    else{
      await page.getByRole('button',{name:/^Classic Tactical/}).click();
      await page.waitForTimeout(2500);
      if(step==='classic'){console.log(await buttons());await page.screenshot({path:'screenshots/battle-sheet/03-classic.png'});}
      else{
        await page.getByRole('button',{name:'Lista',exact:true}).click();
        await page.waitForTimeout(2000);
        if(step==='list'){console.log(await buttons());await page.screenshot({path:'screenshots/battle-sheet/04-list.png'});}
        else await battle();
      }
    }
  }
  console.log('errors',errors);
}finally{await browser.close();}
