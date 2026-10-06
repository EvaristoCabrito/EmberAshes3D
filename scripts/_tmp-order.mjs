import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errs = []; page.on("pageerror", e => { if (!/Hydration/.test(e.message)) errs.push(e.message.slice(0, 300)); });
await page.goto("http://127.0.0.1:8080/"); await page.waitForTimeout(3000);
await page.evaluate(async () => { const s = await import("/src/game/save.ts"); const r = s.emptySave(false); r.completed = ["thebridge"]; r.gameHour = 12; r.unitHp = { Kael: 30 }; s.writeBank(s.writeSlot(s.emptyBank(), 0, r)); });
await page.reload(); await page.waitForTimeout(4000);
await page.getByRole("button", { name: /continuar/i }).click(); await page.waitForTimeout(4000);
await page.locator("button:visible", { hasText: "SLOT 1" }).first().click(); await page.waitForTimeout(5000);
await page.mouse.click(1443, 350); await page.waitForTimeout(2500);
await page.evaluate(() => {
  window.__ord = []; const t0 = performance.now(); let curtain = false, battle = false, label = "";
  const curtainEl = () => { const img = document.querySelector('img[src*="loading-screen"]'); return img ? img.parentElement : null; };
  const check = () => { try { const el = curtainEl(); const c = !!el, b = !!document.querySelector('button[aria-label="Som"]');
    if (c !== curtain) { curtain = c; window.__ord.push(`${Math.round(performance.now() - t0)}ms curtain ${c ? "UP" : "DOWN"}`); }
    if (el && el.getAttribute("aria-label") !== label) { label = el.getAttribute("aria-label") || ""; window.__ord.push(`${Math.round(performance.now() - t0)}ms   label "${label}"`); }
    if (b !== battle) { battle = b; window.__ord.push(`${Math.round(performance.now() - t0)}ms battle ${b ? "MOUNTED" : "unmounted"} (curtain ${curtain ? "up" : "DOWN"})`); } } catch (e) { window.__ord.push("observer error " + e.message); } };
  new MutationObserver(check).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-label"] });
  window.addEventListener("ember:battle-ready", () => window.__ord.push(`${Math.round(performance.now() - t0)}ms ready event (renderer warm)`));
});
await page.getByRole("button", { name: /entrar em combate/i }).click();
await page.waitForTimeout(15000);
const ord = await page.evaluate(() => window.__ord);
const labels = ord.filter(l => l.includes("label")); console.log(ord.filter(l => !l.includes("label")).join("\n")); console.log(`progress label updates: ${labels.length}; first ${labels[0]?.trim()} ; last ${labels.at(-1)?.trim()}`);
await page.screenshot({ path: "work/xp-qa/order-end.png" });
console.log("errors:", errs); await browser.close();
