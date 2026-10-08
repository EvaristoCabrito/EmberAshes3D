import assert from 'node:assert/strict';import {chromium} from 'playwright';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(resolve('work/apparition-lightning-preview.html')).href);await page.waitForFunction(()=>window.__apparitionPreview&&window.__frames.length===60);
 for(const [name,time]of[['charge',2],['release',3.8],['clear',4.8]]){await page.evaluate(t=>window.__setApparitionTime(t),time);await page.waitForTimeout(100);const s=await page.evaluate(()=>window.__apparitionPreview);assert.equal(s.hexes,2);assert.equal(s.glError,0);assert.equal(s.frame,Math.min(60,Math.floor(time*12)+1));await page.locator('canvas').screenshot({path:`work/apparition-lightning-${name}.png`});}
 await page.locator('#direction').selectOption('-1');await page.evaluate(()=>window.__setApparitionTime(3.8));await page.waitForTimeout(80);assert.equal((await page.evaluate(()=>window.__apparitionPreview)).direction,-1);await page.locator('canvas').screenshot({path:'work/apparition-lightning-left.png'});
 assert.deepEqual(errors,[]);console.log('PASS: original ATT timing, two hexes, both directions, charge/release/clear frames, no WebGL or page errors.');
}finally{await browser.close();}
