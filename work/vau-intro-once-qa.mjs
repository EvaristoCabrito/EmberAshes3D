// The vau-intro cutscene plays only at New Game, never when O Vau itself is opened.
// User's running 8080 server, disposable profile; opens mission 01 via the debug list.
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1500,height:950}});
const click=async(name,opts={})=>{await page.getByRole('button',{name,...opts}).first().click({timeout:10000});await page.waitForTimeout(2500);};
try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForTimeout(6000);
  await click('Modo teste');await click(/^Debug/);await click(/^Classic Tactical/);await click('Lista',{exact:true});
  await click(/^01 · /);
  const video=await page.evaluate(()=>[...document.querySelectorAll('video')].map(v=>v.getAttribute('src')));
  const briefing=await page.getByRole('button',{name:'Entrar em combate'}).count();
  console.log('videos on screen',JSON.stringify(video),'briefing shown',briefing>0);
  console.log(!video.includes('/game/vau-intro.mp4')&&briefing>0?'PASS: no O Vau cutscene replay':'FAIL');
}finally{await browser.close();}
