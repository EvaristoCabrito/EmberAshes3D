// Verifies Kael's on-screen size/feet through a real attack, using the game's own engine and the
// art served by the user's running dev server on 8080. Never starts a server.
import { chromium } from 'playwright';
import { checkedUrl } from './browser-guard.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('screenshots/kael-atk-verify', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.route('**/__kael-qa', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body style="margin:0;background:#000"></body></html>' }));
await page.goto(checkedUrl('http://localhost:8080/__kael-qa'));
const rows = await page.evaluate(async () => {
  const { BattleEngine } = await import('/src/game/engine.ts');
  const { loadGameArt, ensureSpriteArt } = await import('/src/game/assets.ts');
  const art = await loadGameArt();
  const m = { id: 'qa-kael', index: 0, title: 'QA', place: '', briefing: '', objective: '', win: 'rout', hub: false, autoTactics: false, fog: false,
    mistType: 'none', environment: 'outdoor', timeOfDay: 'day', cols: 10, rows: 8, layout: Array(8).fill('.'.repeat(10)),
    playerSpawns: [{ name: 'Kael', classId: 'kaelFinal', x: 3, y: 4, level: 3 }], enemySpawns: [{ name: 'B', classId: 'brigand', x: 4, y: 4, level: 3 }], neutralSpawns: [], decorations: [], elementalFx: [] };
  const e = new BattleEngine(m, art, { hp: {}, levels: {} }, 1);
  await ensureSpriteArt(art, e.units.map(u => u.sprite));
  const k = e.units.find(u => u.side === 'player'), d = e.units.find(u => u.side === 'enemy');
  const tile = 60, cell = tile * Math.sqrt(3);
  // measure an image's head row and boot row (same rule as the art rebuild) via a canvas
  const cache = new Map();
  const measure = (img) => {
    if (cache.has(img.src)) return cache.get(img.src);
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const a = g.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
    let boot = null;
    for (let y = H - 1; y >= 0 && boot === null; y--) { let run = 0, best = 0; for (let x = 0; x < W; x++) { if (a[(y * W + x) * 4 + 3] > 200) { run++; best = Math.max(best, run); } else run = 0; } if (best >= 22) boot = y + 1; }
    let top = null; for (let y = 0; y < H && top === null; y++) for (let x = Math.floor(W * .3); x < W * .7; x++) if (a[(y * W + x) * 4 + 3] > 40) { top = y; break; }
    const r = { W, H, boot, top, src: img.src.split('/').pop() }; cache.set(img.src, r); return r;
  };
  const sample = (label) => {
    const v = e.computeUnitVisual(k, cell, tile);
    const r = measure(v.img);
    // on-screen (relative to the unit's ground anchor, +down): image spans [-h+footOffset, footOffset]
    const y0 = -v.h + v.footOffset;
    return { label, frame: r.src, h: +v.h.toFixed(1), footOffset: +v.footOffset.toFixed(1),
      feetY: +(y0 + r.boot / r.H * v.h).toFixed(1), headY: +(y0 + r.top / r.H * v.h).toFixed(1), body: +((r.boot - r.top) / r.H * v.h).toFixed(1) };
  };
  const out = [sample('idle')];
  e.queue.push({ type: 'combat', att: k.id, def: d.id, noCounter: true });
  let lastFrame = '';
  for (let i = 0; i < 2400; i++) {
    e.tick(1 / 60);
    const a = e.active;
    if (a?.type === 'combat' && !a.stage.startsWith('counter') && a.stage !== 'fade') {
      const s = sample(a.stage); if (s.frame !== lastFrame) { out.push(s); lastFrame = s.frame; }
    } else if (out.length > 1 && !a) break;
  }
  out.push(sample('idle after'));
  return out;
});
writeFileSync('screenshots/kael-atk-verify/rows.json', JSON.stringify(rows, null, 1));
console.table(rows);
console.log('errors:', errors.filter(m => !/WebSocket|vite/.test(m)).slice(0, 10));
await browser.close();
