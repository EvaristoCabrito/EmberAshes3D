import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage(); await page.goto('http://127.0.0.1:8080/provoke-preview.html');
 const results=await page.evaluate(async()=>{
 const {BattleEngine}=await import('/src/game/engine.ts'); const {rollCure,rollPotion}=await import('/src/game/data.ts'); const {healingAmount,cleanHeroSkills}=await import('/src/game/skills.ts');
 const results=[]; const art=new Proxy({decorations:{}},{get:(t,k)=>t[k]??{}});
 for(const kind of ['heal','potion','disease','diseasePotion','bless','mana']){
 const mission={id:'healing-qa',index:0,title:'QA',place:'',briefing:'',objective:'',win:'rout',cols:10,rows:6,layout:['    ...   ','  ......  ',' ........ ','......... ',' .......  ','  .....   '],decorations:[],playerSpawns:[{name:'Kael',classId:'swordsman',x:3,y:3},{name:'Neera',classId:'archer',x:4,y:3},{name:'Voss',classId:'conjurer',x:3,y:2}],enemySpawns:[{name:'Enemy',classId:'soldier',x:7,y:3}]};
 const e=new BattleEngine(mission,art,{hp:{},levels:{},heroSkills:{Kael:{healing:11.4},Neera:{healing:100}}},1); const a=e.units.find(u=>u.name==='Kael'),t=e.units.find(u=>u.name==='Neera'); e.rng=()=>.8;a.mov=0;e.selectedId=a.id;t.hp=1;t.maxHp=1000;
 let expected=1;
 if(kind==='heal'){expected+=healingAmount(rollCure('cureMinor',e.affinityUnit(a).mag,()=>.8),11.4);e.stepHeal({att:a.id,def:t.id,kind:'cureMinor',t:0,applied:false},.25)}
 if(kind==='potion'){expected+=healingAmount(rollPotion('weak',()=>.8),11.4);a.bag.weak=1;e.applyPotion(a,t,'weak')}
 if(kind==='disease'){t.diseased=true;e.stepCureDisease({att:a.id,def:t.id,t:0,applied:false},.25)}
 if(kind==='diseasePotion'){t.diseased=true;a.bag.disease=1;e.applyPotion(a,t,'disease')}
 if(kind==='bless')e.stepSpell({type:'spell',att:a.id,ids:[t.id],tiles:[],spellKind:'bless',t:0,applied:false},.35);
 if(kind==='mana'){t.classId='mage';t.level=6;t.spells.tier1=0;a.bag.manaSmall=1;e.applyPotion(a,t,'manaSmall')}
 results.push({kind,hp:t.hp,expected,skill:e.heroSkills.Kael.healing,recipient:e.heroSkills.Neera.healing,diseased:t.diseased,logs:e.getHud().log.filter(s=>s.includes('melhorou Healing'))});
 }
 return {results,precise:healingAmount(1000,11.4),saved:cleanHeroSkills({Kael:{healing:11.4}},["Kael"]).Kael.healing};
 });
 assert.equal(results.precise,1114);assert.equal(results.saved,11.4);
 for(const r of results.results){assert.equal(r.hp,r.expected,r.kind);assert.equal(r.skill,['bless','mana'].includes(r.kind)?11.4:11.5,r.kind);assert.equal(r.recipient,100);if(r.kind.startsWith('disease'))assert.equal(r.diseased,false);}
 console.log(JSON.stringify(results,null,2));console.log('PASS: caster/giver percentage, decimal persistence, healing and disease progression, unchanged Bless and mana.');
}finally{await browser.close()}
