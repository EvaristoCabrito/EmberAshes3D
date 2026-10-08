import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
 const page = await browser.newPage();
 await page.goto('http://127.0.0.1:8087/provoke-preview.html');
 const result = await page.evaluate(async()=>{
  const {BattleEngine}=await import('/src/game/engine.ts');
  const {setMuted}=await import('/src/game/audio.ts');
  const plays=[]; HTMLMediaElement.prototype.play=function(){plays.push({src:this.src,time:this.currentTime});return Promise.resolve()};setMuted(false);
  const e=Object.create(BattleEngine.prototype);
  e.playMeleeCue({name:'Neera',classId:'archer',offHandId:'punhal-curvo'},true);
  e.playMeleeCue({name:'Dagger user',classId:'archer',weaponId:'punhal-curvo'});
  const skills=['cleave','sweep','shoulderSmash','stampede','piercingThrust','trip','doubleStrike','bullRush','executionerStrike'];
  for(const skill of skills)e.playMeleeCue({name:'Kael',classId:'kaelFinal'},false,skill,1.12);
  e.playMeleeCue({name:'Kael',classId:'kaelFinal',weaponId:'espada-longa'},false,undefined,1.12);
  const context=new AudioContext(); const assets=[];
  for(const file of ['Blade3.mp3','Attack2.mp3']){const response=await fetch('/game/MUSIC/SoundFX/'+file);const bytes=await response.arrayBuffer();const decoded=await context.decodeAudioData(bytes);assets.push({file,status:response.status,duration:decoded.duration});}
  await context.close();return {plays,assets};
 });
 assert.equal(result.plays.filter(p=>p.src.endsWith('/Blade3.mp3')).length,2);
 assert.equal(result.plays.filter(p=>p.src.endsWith('/Attack2.mp3')&&p.time===0).length,9);
 assert.ok(result.plays.at(-1).src.endsWith('/BladeSlash1Dagger.mp3'));
 for(const asset of result.assets){assert.equal(asset.status,200);assert.ok(asset.duration>0);}
 console.log('PASS: dagger main/off-hand cues, all nine Kael Blade Skills, normal sword cue, and both MP3 decodes.',result.assets);
} finally {await browser.close();}
