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
  const result = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { DECORATIONS, TERRAIN } = await import('/src/game/data.ts');
    const { BattleEngine } = await import('/src/game/engine.ts');
    const { ThreeBattleRenderer } = await import('/src/game/gfx/three/ThreeBattleRenderer.ts');
    const checks = [];
    const check = (name, ok, detail) => { checks.push({ name, ok, detail }); };
    const image = async src => { const img = new Image(); img.src = src; await img.decode(); return img; };
    const { tileVariantSrc } = await import('/src/game/assets.ts');
    const floor = await image(tileVariantSrc('nave', 0));
    const marker = document.createElement('canvas'); marker.width = 64; marker.height = 128;
    const markerCtx = marker.getContext('2d'); markerCtx.fillStyle = '#00ff00'; markerCtx.fillRect(8, 4, 48, 124);
    const sprite = await image(marker.toDataURL());
    const sprites = new Proxy({}, { get: () => [sprite] });
    const art = new Proxy({ tiles: Object.fromEntries(Object.keys(TERRAIN).map(id => [id, [floor]])), decorations: {}, sprites, impact: [] }, { get: (t, k) => t[k] ?? {} });
    const mission = { id: 'architecture-qa', index: 1, title: 'QA', place: '', briefing: '', objective: '', cols: 12, rows: 12, layout: Array(12).fill('n'.repeat(12)), playerSpawns: [{ name: 'QA', classId: 'swordsman', x: 5, y: 5 }], enemySpawns: [], neutralSpawns: [], decorations: [
      ...[3,4,5,6,7].map(x => ({ id: 'wall-3d-tower', x, y: 4 })),
      { id: 'door-3d-frame', x: 3, y: 7, rot: 0 },
      { id: 'door-3d-closed', x: 6, y: 7, rot: 0 },
      { id: 'door-3d-frame', x: 9, y: 7, rot: 1 },
    ], explore: true, autoTactics: false, win: 'rout', fog: false, mistType: 'none' };
    const draft = (await import('/src/game/maps/watchtower-undercroft001.json')).default.draft;
    const {draftToMission}=await import('/src/game/mapstore.ts');
    const {mapFloorRects}=await import('/src/game/mapFloor.ts');
    const {ensureDecorationArt}=await import('/src/game/assets.ts');
    for(const [i,id] of draft.tiles.entries()) {
      if(id==='void') continue;
      const v=draft.tileVariants[i]??0;
      if(!art.tiles[id][v] || art.tiles[id][v]===floor) art.tiles[id][v]=await image(tileVariantSrc(id,v));
    }
    await ensureDecorationArt(art,draft.decorations.filter(p=>!DECORATIONS[p.id]?.model3d).map(p=>p.id));
    for (const environment of ["indoor", "outdoor"]) for (const tactics of [false, true]) {
      const indoorEngine = new BattleEngine({...draftToMission(draft), environment, playerSpawns:[], enemySpawns:[], neutralSpawns:[], fog: false}, art, {hp:{},levels:{}}, 1);
      indoorEngine.setZoom(0);
      indoorEngine.tacticsCamera = tactics;
      const indoorCanvas=document.createElement("canvas"); document.body.replaceChildren(indoorCanvas); const indoorRenderer = new ThreeBattleRenderer(indoorCanvas, indoorEngine);
      indoorRenderer.setSize(1100,800,1); indoorRenderer.render(1100,800);
      for(let wait=0; wait<300 && !indoorRenderer.isWarm();wait++) await new Promise(resolve=>setTimeout(resolve,100)); indoorRenderer.render(1100,800); const surface = indoorRenderer.terrainSolid.geometry;
      const pos = surface.getAttribute('position'), index = surface.index;
      const edges = new Map();
      for(let k=0;k<surface.groups[0].count;k+=3) {
        const tri=[index.getX(k),index.getX(k+1),index.getX(k+2)];
        for(let j=0;j<3;j++) {const a=tri[j],b=tri[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');const e=edges.get(key);if(e)e.count++;else edges.set(key,{a,b,count:1});}
      }
      const perimeter=[...edges.values()].filter(e=>e.count===1);
      check(environment+' perimeter is entirely orthogonal, tactics '+tactics, perimeter.every(({a,b})=>Math.abs(pos.getX(a)-pos.getX(b))<.001 || Math.abs(pos.getY(a)-pos.getY(b))<.001));
      
      check('no automatically added walls '+environment,indoorEngine.decorations.length===draft.decorations.length);
      const rects=mapFloorRects(indoorEngine.tiles,indoorEngine.cols,indoorEngine.rows,indoorEngine.decorations);
      const wall=indoorRenderer.wallEntries.find(e=>e.placement.x===4&&e.placement.y===5);
      const ray=new THREE.Raycaster(new THREE.Vector3(wall.mesh.position.x,wall.mesh.position.y,10000),new THREE.Vector3(0,0,-1));
      ray.ray.origin.y=wall.mesh.position.y;
      indoorRenderer.terrainSolid.updateMatrixWorld(true);
      check(environment+' floor reaches wall foot on odd row, tactics '+tactics,ray.intersectObject(indoorRenderer.terrainSolid).length>0);
      const tile=indoorEngine.layout.tile;
      const rect=rects.get(5*draft.cols+4);
      ray.ray.origin.x=rect.minX*tile-tile*.02;
      check('no floor outside west wall '+environment+' '+tactics,ray.intersectObject(indoorRenderer.terrainSolid).length===0);
      let testedFaces=0,outsideHits=0;
      for(const [key,r] of rects) {
        const col=key%draft.cols,row=Math.floor(key/draft.cols);
        const points=[];
        if(r.minX>col*Math.sqrt(3)+1e-6)points.push([r.minX-.02,(r.minY+r.maxY)/2]);
        if(r.maxX<(col+1)*Math.sqrt(3)-1e-6)points.push([r.maxX+.02,(r.minY+r.maxY)/2]);
        if(r.minY>row*1.5+1e-6)points.push([(r.minX+r.maxX)/2,r.minY-.02]);
        if(r.maxY<(row+1)*1.5-1e-6)points.push([(r.minX+r.maxX)/2,r.maxY+.02]);
        for(const [x,y] of points){ray.ray.origin.set(x*tile,-(y+2.4+.25)*tile,10000);testedFaces++;outsideHits+=ray.intersectObject(indoorRenderer.terrainSolid).length;}
      }
      check('no floor outside any enclosing wall face '+environment+' '+tactics,testedFaces>0 && outsideHits===0,{testedFaces,outsideHits});
      for(let wait=0;wait<100 && !wall.mesh.material.map.image;wait++) await new Promise(resolve=>setTimeout(resolve,100));
      check('authored walls use matching crypt masonry '+environment,wall.mesh.material.map.image?.src.endsWith('crypt-v2.png'));
      if(!tactics) check('boundary hex decals cannot protrude',!indoorRenderer.tileMeshes.get(5*draft.cols+4).mesh.visible,{environment:indoorEngine.mission.environment,cols:indoorEngine.cols,tiles:indoorEngine.tiles.slice(5*draft.cols+3,5*draft.cols+5)});
      window.__indoorQA={engine:indoorEngine,renderer:indoorRenderer};
      indoorRenderer.render(1100,800);
      window.__lastRenderer=indoorRenderer;
      if(environment==='indoor' && !tactics) { indoorEngine.centerOnStartingParty(); indoorRenderer.render(1100,800); }
      if(!(environment==='outdoor' && tactics)) indoorRenderer.dispose();
    }

    return checks;
  });
  await page.screenshot({ path: 'C:/emberashes03D-main/artifacts/dungeon-walls-qa.png' });
  console.log(JSON.stringify({ result, errors }, null, 2));
  assert.equal(errors.length, 0, 'browser/shader errors');
  for (const check of result) assert.ok(check.ok, check.name);
} finally { await browser?.close(); await vite.close(); }



