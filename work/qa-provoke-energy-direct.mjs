import assert from 'node:assert/strict';import {chromium} from 'playwright';
const b=await chromium.launch({channel:'msedge',headless:true});
try{const p=await b.newPage({viewport:{width:1100,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8080/provoke-preview.html');await p.waitForFunction(()=>window.__provokePreview?.webgl);
const result=await p.evaluate(async()=>{
 const {BattleEngine}=await import('/src/game/engine.ts');const {spellIcon}=await import('/src/game/data.ts');
 const art=new Proxy({decorations:{}},{get:(t,k)=>t[k]??{}});
 const layout=['    ...   ','  ......  ',' ........ ','......... ',' .......  ','  .....   '];
 const m={id:'provoke-qa',index:0,title:'QA',place:'',briefing:'',objective:'',win:'rout',cols:10,rows:6,layout,decorations:[],playerSpawns:[{name:'Kael',classId:'swordsman',x:3,y:3,level:6}],enemySpawns:[{name:'Enemy',classId:'soldier',x:4,y:3,level:6},{name:'Enemy2',classId:'soldier',x:5,y:3,level:6}]};
 const e=new BattleEngine(m,art,{hp:{},levels:{}},1);const caster=e.units.find(u=>u.side==='player');const foe=e.units.find(u=>u.side==='enemy');caster.level=6;caster.acted=false;e.selectedId=caster.id;e.startProvoke();e.castProvoke(caster,{x:foe.x,y:foe.y});
 const started=e.provokeFx.length;const log=e.getHud().log;const enmity=e.enmity.get(foe.id)?.get(caster.id);
 // Test actual engine render path using the preview WebGL renderer, excluding missing test art.
 const {WebGL2DRenderer}=await import('/src/game/gfx/WebGL2DRenderer.ts');const c=document.createElement('canvas');c.width=960;c.height=480;const ctx=new WebGL2DRenderer(c);e.renderUnitsAndOverlays(ctx,960,480,undefined,true,true,true,true,true,true,true,true);const glError=ctx.gl.getError();
 for(let i=0;i<90;i++)e.tick(.05);return {started,remaining:e.provokeFx.length,enmity,glError,log:log.slice(-3),icon:spellIcon('provoke')};
});console.log(result);assert.ok(result.started>=1);assert.equal(result.remaining,0);assert.ok(result.enmity);assert.equal(result.glError,0);assert.equal(result.icon,'/game/icons/provoke.jpg');console.log(result);
await p.locator('#group').click();await p.locator('#replay').click();await p.waitForTimeout(230);await p.locator('#pause').click();await p.screenshot({path:'work/provoke-energy-preview.png'});assert.deepEqual(errors,[]);console.log('PASS: cast, enmity, WebGL combat render path, FX expiry, icon, preview');}finally{await b.close()}


