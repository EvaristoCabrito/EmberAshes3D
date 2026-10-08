import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const b=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await b.newPage({viewport:{width:1100,height:1300}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(resolve('work/turn-undead-v2-preview.html')).href);await p.waitForFunction(()=>window.__turnUndeadPreview?.webgl);
 for(const [radius,count] of [[1,7],[2,19],[3,37]]){
  await p.locator('#radius').selectOption(String(radius));await p.evaluate(()=>window.__setPreviewTime(.55));await p.waitForTimeout(80);
  const state=await p.evaluate(()=>window.__turnUndeadPreview);assert.equal(state.cells,count);assert.equal(state.glError,0);
 }
 await p.locator('#radius').selectOption('2');await p.evaluate(()=>window.__setPreviewTime(.55));await p.waitForTimeout(80);await p.screenshot({path:'work/turn-undead-v2-preview.png'});await p.locator('canvas').screenshot({path:'work/turn-undead-v2-effect.png'});
 await p.evaluate(()=>window.__setPreviewTime(2.3));await p.waitForTimeout(80);assert.deepEqual(errors,[]);
 console.log('PASS: file-only WebGL preview, all three exact hex areas (7/19/37), effect expiry, no WebGL or page errors, screenshot saved.');
}finally{await b.close()}
