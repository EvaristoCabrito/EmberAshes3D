#!/usr/bin/env node
/**
 * Screenshot QA for the Dev Controls preview widget (src/game/gfx/three/DevGfxPreview.tsx).
 * Drives mountDevGfxPreview() directly against the already-running dev server (same pattern
 * as scripts/shadow-qa.mjs driving ThreeBattleRenderer directly) — no menu navigation, no React.
 *
 *   node scripts/devgfx-preview-qa.mjs <label>          # against http://127.0.0.1:8080/
 *   node scripts/devgfx-preview-qa.mjs <label> <url>
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { checkedUrl } from "./browser-guard.mjs";

const label = process.argv[2];
if (!label) {
  console.error("usage: node scripts/devgfx-preview-qa.mjs <label> [url]");
  process.exit(2);
}
const url = checkedUrl(process.argv[3] || "http://127.0.0.1:8080/");
const outDir = new URL("../screenshots/devgfx-preview/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 500, height: 400 } });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") pageErrors.push(m.text());
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
} catch (err) {
  console.error(`[devgfx-preview-qa] ${url} did not answer — is the dev server up? (${err.message.split("\n")[0]})`);
  await browser.close();
  process.exit(2);
}

const result = await page.evaluate(async () => {
  const { mountDevGfxPreview } = await import("/src/game/gfx/three/DevGfxPreview.tsx");
  const { setDevGfx } = await import("/src/game/gfx/three/devGfx.ts");

  const canvas = document.createElement("canvas");
  canvas.style.width = "420px";
  canvas.style.height = "260px";
  document.body.appendChild(canvas);
  mountDevGfxPreview(canvas);

  // Let the sprite texture load (async) and a few frames render.
  await new Promise((r) => setTimeout(r, 500));

  function cropZoom(srcCanvas, sx, sy, sw, sh, scale) {
    const out = document.createElement("canvas");
    out.width = sw * scale;
    out.height = sh * scale;
    const ctx = out.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcCanvas, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return out.toDataURL("image/png");
  }

  async function capture(patch, label) {
    setDevGfx(patch);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const w = canvas.width;
    const h = canvas.height;
    return {
      label,
      dataUrl: canvas.toDataURL("image/png"),
      zoomDataUrl: cropZoom(canvas, w * 0.22, h * 0.5, w * 0.56, h * 0.45, 4),
    };
  }

  const shots = [];
  shots.push(await capture({ realShadows: true, softShadows: true, contactShadows: true }, "all-on"));
  shots.push(await capture({ realShadows: false, softShadows: true, contactShadows: true }, "contact-only"));
  shots.push(await capture({ realShadows: true, softShadows: true, contactShadows: false }, "real-only"));
  shots.push(await capture({ realShadows: false, softShadows: true, contactShadows: false }, "both-off"));

  return shots;
});

if (pageErrors.length) {
  console.log(`[devgfx-preview-qa] ${pageErrors.length} page error(s):`);
  for (const e of pageErrors.slice(0, 10)) console.log(`[devgfx-preview-qa]   ${e}`);
}

for (const { label: shotLabel, dataUrl, zoomDataUrl } of result) {
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  const path = new URL(`${label}-${shotLabel}.png`, outDir);
  writeFileSync(path, Buffer.from(b64, "base64"));
  console.log(`[devgfx-preview-qa] -> ${path.pathname.replace(/^\//, "")}`);

  const zb64 = zoomDataUrl.replace(/^data:image\/png;base64,/, "");
  const zoomPath = new URL(`${label}-${shotLabel}-zoom.png`, outDir);
  writeFileSync(zoomPath, Buffer.from(zb64, "base64"));
  console.log(`[devgfx-preview-qa] -> ${zoomPath.pathname.replace(/^\//, "")}`);
}

await browser.close();
if (pageErrors.length) process.exit(1);
