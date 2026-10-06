// Renders Kael idle + attack frames with the game's own renderer (Canvas2D shim path), side by
// side on one strip, against the user's running dev server on 8080. Never starts a server.
import { chromium } from 'playwright';
import { checkedUrl } from './browser-guard.mjs';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 3100, height: 700 } });
await page.route('**/__kael-shot', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body style="margin:0;background:#222"></body></html>' }));
await page.goto(checkedUrl('http://localhost:8080/__kael-shot'));
await page.evaluate(async () => {
  const { BattleEngine } = await import('/src/game/engine.ts');
  const { loadGameArt, ensureSpriteArt } = await import('/src/game/assets.ts');
  const { WebGL2DRenderer } = await import('/src/game/gfx/WebGL2DRenderer.ts');
  const art = await loadGameArt();
  const m = { id: 'qa-kael-shot', index: 0, title: 'QA', place: '', briefing: '', objective: '', win: 'rout', hub: false, autoTactics: false, fog: false,
    mistType: 'none', environment: 'outdoor', timeOfDay: 'day', cols: 10, rows: 8, layout: Array(8).fill('.'.repeat(10)),
    playerSpawns: [{ name: 'Kael', classId: 'kaelFinal', x: 3, y: 4, level: 3 }], enemySpawns: [{ name: 'B', classId: 'brigand', x: 7, y: 1, level: 3 }], neutralSpawns: [], decorations: [], elementalFx: [] };
  const e = new BattleEngine(m, art, { hp: {}, levels: {} }, 1);
  await ensureSpriteArt(art, e.units.map(u => u.sprite));
  const k = e.units.find(u => u.side === 'player'), d = e.units.find(u => u.side === 'enemy');
  e.zoom = 3;
  const W = 1600, H = 1100, src = document.createElement('canvas'); src.width = W; src.height = H;
  const r = new WebGL2DRenderer(src);
  const strip = document.createElement('canvas'); const want = ['idle', 1, 8, 12, 15, 20, 23, 27, 30, 36];
  const cw = 300, ch = 640; strip.width = cw * want.length; strip.height = ch + 20; strip.style.cssText = 'position:absolute;left:0;top:0';
  document.body.append(strip); const sg = strip.getContext('2d'); sg.fillStyle = '#222'; sg.fillRect(0, 0, strip.width, strip.height);
  const snap = (slot, label) => {
    r.setSize(W, H); r.clear(); r.setTransform(1, 0, 0, 1, 0, 0); e.renderUnitsAndOverlays(r, W, H);
    const c = e.hexCenter(k.x, k.y);
    sg.drawImage(src, c.cx - cw / 2, c.cy - ch + 110, cw, ch, slot * cw, 20, cw, ch);
    sg.strokeStyle = '#fc0'; sg.beginPath(); sg.moveTo(slot * cw, 20 + ch - 110); sg.lineTo(slot * cw + cw, 20 + ch - 110); sg.stroke();
    sg.fillStyle = '#ff0'; sg.font = '13px sans-serif'; sg.fillText(String(label), slot * cw + 4, 14);
  };
  k.facing = 1;
  snap(0, 'idle');
  // drive the attack and capture chosen frames (frame index comes from the engine's own pose)
  e.queue.push({ type: 'combat', att: k.id, def: d.id, noCounter: true });
  const got = new Set();
  for (let i = 0; i < 2400 && got.size < want.length - 1; i++) {
    e.tick(1 / 60);
    const v = e.computeUnitVisual(k, 72 * Math.sqrt(3), 72);
    const f = Number((v.img?.src.match(/atk-(\d+)\.png/) ?? [])[1]);
    const slot = want.indexOf(f);
    if (slot > 0 && !got.has(f)) { got.add(f); snap(slot, 'atk ' + f); }
  }
});
await page.waitForTimeout(300);
await page.screenshot({ path: 'screenshots/kael-atk-verify/kael-idle-vs-attack-real-render-zoom.png', clip: { x: 0, y: 0, width: 3000, height: 665 } });
await browser.close();
