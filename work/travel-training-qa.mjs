// Checks travel training on the user's running 8080 server (never starts one): the one-time
// hint after A Ponte de Pedra, opening Party → Skills from it, picking "Treinar", and real
// stepOverworld travel paying +0.1 per 12 road hours.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('screenshots/travel-training',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message);});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,300));});
await page.route('**/__travel-qa',r=>r.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
try{
  await page.goto('http://127.0.0.1:8080/__travel-qa');
  await page.evaluate(async()=>{
    const refresh=await import('/@react-refresh');refresh.default.injectIntoGlobalHook(window);
    window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>t=>t;window.__vite_plugin_react_preamble_installed__=true;
    const React=await import('/node_modules/.vite/deps/react.js');
    const ReactDOM=await import('/node_modules/.vite/deps/react-dom_client.js');
    const {OverworldMapScreen}=await import('/src/game/OverworldMapScreen.tsx');
    const {WORLD_LOCATIONS}=await import('/src/game/data.ts');
    const {emptySave}=await import('/src/game/save.ts');
    const {TRAVEL_TRAINING_HINT_FLAG}=await import('/src/game/skills.ts');
    await import('/src/styles.css');
    const R=React.default??React;const h=R.createElement;
    window.__save={...emptySave(),flags:['recruited:Neera','recruited:Voss','recruited:Salazar'],completed:['vau','bosque','aldeia','thebridge'],rations:20};
    // No hooks out here (the deps copy of React differs from the screen's), so re-render the root.
    let root;
    window.__setSave=s=>{window.__save=s;root.render(Host(s));};
    const write=s=>window.__setSave(s);
    function Host(save){
      return h(OverworldMapScreen,{locations:WORLD_LOCATIONS,status:()=>'available',missionStatus:()=>'available',ember:0,test:false,muted:true,onMute(){},
        overworldPos:save.overworldPos,gameClock:0,rations:3,hungerStreak:0,heroHunger:{},save,onUseRation(){},onOpenStatus(){},event:null,onDismissEvent(){},onStep(){},onBack(){},onPick(){},
        onSetTravelTraining(hero,skill){const c=window.__save;const t={...c.travelTraining};if(skill)t[hero]=skill;else delete t[hero];
          write({...c,travelTraining:t,travelTrainingHours:{...c.travelTrainingHours,[hero]:0},flags:c.flags.includes(TRAVEL_TRAINING_HINT_FLAG)?c.flags:[...c.flags,TRAVEL_TRAINING_HINT_FLAG]});},
        onSeenTravelTrainingHint(){const c=window.__save;if(!c.flags.includes(TRAVEL_TRAINING_HINT_FLAG))write({...c,flags:[...c.flags,TRAVEL_TRAINING_HINT_FLAG]});}});
    }
    document.body.style.cssText='margin:0;width:1500px;height:950px;background:black';
    const host=document.createElement('div');host.style.cssText='position:relative;width:1500px;height:950px;overflow:hidden';document.body.append(host);
    root=(ReactDOM.createRoot??ReactDOM.default.createRoot)(host);root.render(Host(window.__save));
  });
  await page.waitForTimeout(2500);
  const note=page.getByRole('note',{name:'Dica: treino na estrada'});
  console.log('hint visible after thebridge:',await note.isVisible());
  await page.screenshot({path:'screenshots/travel-training/01-hint-after-stone-bridge.png'});
  await note.getByRole('button',{name:'Abrir Party · Skills'}).click();
  await page.waitForTimeout(400);
  const dialog=page.getByRole('dialog');
  console.log('skills tab selected:',await page.getByRole('tab',{name:'Skills'}).getAttribute('aria-selected'));
  await page.getByRole('button',{name:'Treinar Poison Resistance de Kael na estrada'}).click();
  await page.getByRole('button',{name:'Treinar Swords de Kael na estrada'}).click(); // switch: only one at a time
  await page.getByRole('button',{name:'Treinar Poison Resistance de Neera na estrada'}).click();
  await page.waitForTimeout(300);
  console.log('training after clicks:',JSON.stringify(await page.evaluate(()=>window.__save.travelTraining)));
  console.log('kael pressed rows:',JSON.stringify(await dialog.locator('button[aria-pressed=true]').evaluateAll(b=>b.map(x=>x.getAttribute('aria-label')))));
  await dialog.screenshot({path:'screenshots/travel-training/02-skills-tab-training-picked.png'});
  // Real travel: step the party with stepOverworld and report hours + skill gains.
  const travel=await page.evaluate(async()=>{
    const {stepOverworld,neighborsOf,travelHoursForHex}=await import('/src/game/overworld.ts');
    const {WORLD_LOCATIONS}=await import('/src/game/data.ts');
    let s=window.__save;const log=[];let hours=0;let prev=null;
    for(let i=0;i<10;i++){
      const here=s.overworldPos;let moved=false;
      for(const n of neighborsOf(here.col,here.row)){const x=n.x??n.col,y=n.y??n.row;if(prev&&prev.col===x&&prev.row===y)continue;const r=stepOverworld(s,x,y,WORLD_LOCATIONS,true);if(r.save!==s){hours+=travelHoursForHex(x,y,WORLD_LOCATIONS);prev=here;s=r.save;moved=true;break;}}
      if(!moved)break;
      log.push({hours,neera:s.heroSkills?.Neera?.poisonResistance??0,kaelSword:s.heroSkills?.Kael?.swordWeapon??0,banked:{...s.travelTrainingHours}});
    }
    window.__setSave(s);return log;
  });
  for(const row of travel)console.log(JSON.stringify(row));
  await page.waitForTimeout(400);
  await dialog.screenshot({path:'screenshots/travel-training/03-skills-tab-after-travel.png'});
  await page.getByRole('button',{name:'Fechar Party'}).click();
  await page.waitForTimeout(300);
  console.log('hint gone after acting on it:',!(await note.isVisible().catch(()=>false)));
  console.log('errors',errors);
}finally{await browser.close();}
