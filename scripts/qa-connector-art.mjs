import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { checkedUrl } from './browser-guard.mjs';

// Run QA on a temporary loopback port and close it in finally, so this check never
// leaves the application's normal development port occupied.
const vite = await createServer({ mode: 'development', server: { host: '127.0.0.1', port: 0 } });
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
  const result=await page.evaluate(async()=>{
    const {WebGL2DRenderer}=await import('/src/game/gfx/WebGL2DRenderer.ts');
    const {BattleEngine}=await import('/src/game/engine.ts');
    const {ThreeBattleRenderer}=await import('/src/game/gfx/three/ThreeBattleRenderer.ts');
    const {TERRAIN,decorationPlacementArt}=await import('/src/game/data.ts');
    const {ensureDecorationArt,tileVariantSrc}=await import('/src/game/assets.ts');
    const image=async src=>{const im=new Image();im.src=src;await im.decode();return im;};
    const floor=await image(tileVariantSrc('nave',5));
    const art=new Proxy({tiles:Object.fromEntries(Object.keys(TERRAIN).map(id=>[id,[floor]])),decorations:{},sprites:{},impact:[]},{get:(t,k)=>t[k]??{}});
    await ensureDecorationArt(art,['floor-connector']);
    const mission={id:'connector-art-qa',title:'QA',index:1,place:'',briefing:'',objective:'',win:'escape',cols:8,rows:6,layout:Array(6).fill('n'.repeat(8)),fog:false,explore:true,playerSpawns:[],enemySpawns:[],neutralSpawns:[],decorations:[{id:'floor-connector',x:2,y:3,targetMapId:'deeper'},{id:'floor-connector',x:5,y:3,targetMapId:'previous',returnConnector:true}],sunIntensity:.7,ambientIntensity:1,mistType:'none'};
    const checks=[];const check=(name,ok)=>checks.push({name,ok});
    check('both directional images preload',art.decorations['floor-connector-down-red-v1']?.naturalWidth>0&&art.decorations['floor-connector-up-gold-v1']?.naturalWidth>0);
    document.body.style.margin='0';document.body.style.background='#000';window.connectorShots=[];
    for(const tactics of [false,true]){
      const engine=new BattleEngine(mission,art,{hp:{},levels:{}},1);engine.setZoom(1);engine.tacticsCamera=tactics;
      const canvas=document.createElement('canvas');document.body.replaceChildren(canvas);
      const renderer=new ThreeBattleRenderer(canvas,engine);renderer.setSize(1100,800,1);renderer.render(1100,800);
      for(let wait=0;wait<300&&!renderer.isWarm();wait++)await new Promise(r=>setTimeout(r,100));renderer.render(1100,800);
      for(const entry of renderer.decorEntries){check('correct connector image '+tactics+' '+entry.placement.targetMapId,entry.mesh.material.map.image.src.endsWith(decorationPlacementArt(entry.placement)+'.png'));}
      check('both placed connectors render '+tactics,renderer.decorEntries.filter(e=>e.placement.id==='floor-connector').length===2);
      const copy=document.createElement('canvas');copy.width=1100;copy.height=800;copy.getContext('2d').drawImage(canvas,0,0);window.connectorShots.push(copy.toDataURL());
      engine.decorations[0].returnConnector=true;renderer.render(1100,800);
      check('direction toggle updates existing connector '+tactics,renderer.decorEntries.find(e=>e.placement.targetMapId==='deeper').mesh.material.map.image.src.endsWith('floor-connector-up-gold-v1.png'));
      check('destinations remain unchanged '+tactics,engine.decorations[0].targetMapId==='deeper'&&engine.decorations[1].targetMapId==='previous');
      renderer.dispose();
    }
    const legacy=new BattleEngine(mission,art,{hp:{},levels:{}},1);legacy.setZoom(1);const canvas=document.createElement('canvas');canvas.width=1100;canvas.height=800;document.body.replaceChildren(canvas);
    const ctx=new WebGL2DRenderer(canvas);ctx.setSize(1100,800);legacy.renderGround(ctx,1100,800,1);legacy.renderUnitsAndOverlays(ctx,1100,800);
    const capture=document.createElement('canvas');capture.width=1100;capture.height=800;const captureCtx=capture.getContext('2d');captureCtx.drawImage(canvas,0,0);const pixels=captureCtx.getImageData(0,0,1100,800).data;let red=0,gold=0;
    for(let i=0;i<pixels.length;i+=4){if(pixels[i]>150&&pixels[i]>pixels[i+1]*1.5&&pixels[i]>pixels[i+2]*1.5)red++;if(pixels[i]>150&&pixels[i+1]>100&&pixels[i+2]<pixels[i+1]*.6)gold++;}
    check('legacy view draws visible red and gold art',red>20&&gold>20);window.connectorShots.push(capture.toDataURL());
    return checks;
  });
  const shots=await page.evaluate(()=>window.connectorShots);const {writeFileSync}=await import('node:fs');for(let i=0;i<shots.length;i++)writeFileSync('artifacts/connector-art-qa-'+i+'.png',Buffer.from(shots[i].split(',')[1],'base64'));
  console.log(JSON.stringify({result,errors},null,2));assert.equal(errors.length,0);for(const c of result)assert.ok(c.ok,c.name);
}finally{await browser?.close();await vite.close();}
