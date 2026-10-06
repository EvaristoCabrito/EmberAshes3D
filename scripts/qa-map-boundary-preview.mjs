import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { checkedUrl } from './browser-guard.mjs';

// Run QA on a temporary loopback port and close it in finally, so this check never
// leaves the application's normal development port occupied.
const vite = await createServer({ plugins: [{name:'map-preview-qa',enforce:'pre',configureServer(server){server.middlewares.use(async(req,res,next)=>{if(req.url!=='/__qa_map_preview')return next();res.setHeader('content-type','text/html');res.end(await server.transformIndexHtml('/__qa_map_preview',readFileSync('artifacts/map-boundary-preview-qa.html','utf8')));});}}], mode: 'development', server: { host: '127.0.0.1', port: 0 } });
await vite.listen();
const address = vite.httpServer.address();
assert.ok(address && typeof address !== 'string');
const baseUrl = `http://127.0.0.1:${address.port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(checkedUrl(`${baseUrl}/game/icons/gold-coins-pile.png`));
  await page.goto(checkedUrl(baseUrl+'/__qa_map_preview'));
  try {await page.waitForFunction(()=>window.previewQAReady);} catch(e) {console.log({errors,title:await page.title(),body:(await page.locator('body').innerText()).slice(0,1000)});throw e;}
  await page.waitForTimeout(2000);
  const screenshot=await page.screenshot({path:'C:/emberashes03D-main/artifacts/map-boundary-editor-qa.png'});
  const result=await page.evaluate(async encoded=>{
    const canvas=new Image();canvas.src='data:image/png;base64,'+encoded;await canvas.decode();
    const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;
    const ctx=copy.getContext('2d');ctx.drawImage(canvas,0,0);
    const {data}=ctx.getImageData(0,0,copy.width,copy.height);
    const tops=[];
    for(let x=0;x<copy.width;x++) {
      let top=-1;for(let y=80;y<copy.height;y++){const i=(y*copy.width+x)*4;if(data[i]+data[i+1]+data[i+2]>70){top=y;break;}}
      if(top>=0)tops.push({x,top});
    }
    const middle=tops.slice(60,-60);
    return {width:copy.width,height:copy.height,occupied:tops.length,topValues:[...new Set(middle.map(p=>p.top))]};
  },screenshot.toString('base64'));
  console.log(JSON.stringify({result,errors},null,2));
  assert.ok(result.occupied>200);assert.equal(result.topValues.length,1,'editor preview top border must be straight');assert.equal(errors.length,0);
} finally {await browser?.close();await vite.close();}
