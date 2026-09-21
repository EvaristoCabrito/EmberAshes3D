# Three.js migration — Milestone 1 handoff

Read this before touching `src/game/gfx/three/`. Delete this file once Milestone 1 (units
included) is done and confirmed — it's a handoff note, not permanent documentation.

## Goal (user's explicit directive — do not drift from this)

Ember Ashes stays a 2D tactical RPG in gameplay and artwork. Three.js is being introduced
**only** as the battlefield rendering layer, to give the existing 2D art a real spatial/world
coordinate system — so that later, DirectionalLight/shadows (Milestone 2), world-space fog and
particles (Milestone 3), and bloom/post-processing (Milestone 4) all have actual 3D geometry to
work with, instead of being simulated as fullscreen 2D overlays (the old `AtmosphereRenderer`
approach, which the user explicitly rejected — see below).

**Milestone gating, strict:** do not start Milestone 2 (lighting) until Milestone 1 (rendering
parity: terrain + decorations + units + camera + mouse interaction, matching the existing
renderer exactly) is fully done and verified. No atmosphere, no fog, no bloom, no Sun/Moon, no
particles yet — those come after.

Do not rewrite gameplay systems (combat, pathfinding, AI, hex math, editor data) — this is a
rendering-layer swap only.

## Old atmosphere system — superseded, do not extend

`src/game/gfx/AtmosphereRenderer.ts`, `atmosphereShaders.ts`, `atmosphereParams.ts` are
fullscreen-2D-overlay code from before this migration decision. The user explicitly rejected
that approach ("does not convincingly occupy the game world... flat image with a moving filter
over it") and redirected to Three.js instead. These three files are left in the tree
unreferenced (harmless dead code) — do not wire them into anything, do not spend time improving
them. Milestones 2/3 will use Three.js's own `DirectionalLight`, fog, and particle systems
instead, built fresh against the new scene from this migration.

## Where things stand right now

`src/game/gfx/three/ThreeBattleRenderer.ts` — new, replaces the ground/terrain canvas only.
Toggle: append `?renderer=three` to the app URL (see `useThreeGroundRenderer()` at the top of
`src/game/BattleCanvas.tsx`). Without the query param, nothing changes for anyone — the original
`WebGL2DRenderer` path is untouched and still the default.

**Done and verified (build + typecheck + full test suite pass; visually verified via headless
Playwright, NOT the live browser — see the memory note below on why):**

- Terrain tiles: real hex-shaped geometry (`buildHexGeometry()`), one mesh per tile, built once
  at a fixed world position, textured with the same art the Canvas2D renderer uses. Camera pans/
  zooms by moving the camera, not the tiles.
- Ground/behind-layer decorations (trees, houses, rubble — `ensureDecorBuilt()`): same
  "built once at world position" approach, correct sizing (ported `decorSize()` from
  `BattleEngine.drawDecorations`), correct facing/mirror art, fog-of-war visibility toggled per
  frame without rebuilding.
- `BattleEngine.renderUnitsAndOverlays` got a new `skipGroundDecor` param (last arg) so it
  doesn't double-draw ground/behind decorations when `ThreeBattleRenderer` already drew them —
  `BattleCanvas.tsx` passes `!!rendererThree`. The "front"-layer decoration call inside
  `renderUnitsAndOverlays` is untouched and still always runs.
- `BattleEngine.updateCameraLayout(cssW, cssH): number` — new public method, factored out of
  `renderGround`'s non-drawing prefix (camera/visibility bookkeeping only). `ThreeBattleRenderer`
  calls this instead of `renderGround` every frame. `renderGround` itself calls it too now, so
  the original Canvas2D path's behavior is byte-for-byte unchanged.
- `ZOOM_RADII` in `engine.ts` is now `export`ed (was module-private) — needed by anything outside
  engine.ts that wants tile size per zoom level.

**Not done yet — units are the rest of Milestone 1:**

Units, HP bars, the hover/selection hex outline, portal FX, and "front"-layer decorations still
render entirely through the old Canvas2D-shim `unitsCanvas` (`WebGL2DRenderer`), stacked above
the Three.js ground canvas — unchanged, and currently correct/working since that layer was never
broken.

## The critical gotcha already found — do not reintroduce it

**An orthographic camera with an inverted frustum (`top < bottom`) renders NOTHING in this
Three.js version (0.186)** — confirmed empirically with isolated Playwright tests: identical
scene/camera/mesh renders correctly with a standard frustum (`top > bottom`) and renders nothing
with an inverted one, regardless of camera or mesh position. The natural instinct — invert the
frustum to get "world Y increases downward the screen" matching `BattleEngine`'s `cx/cy`
convention — silently produces a blank canvas.

The fix already in place: keep the frustum standard (`top = cssH, bottom = 0`), and instead
negate Y everywhere in `ThreeBattleRenderer` — mesh `position.y = -wy`, camera
`position.y = -camY - cssH`. This was verified NUMERICALLY (not just visually) against
`BattleEngine`'s own `cx = worldX - camX` / `cy = worldY - camY` formula before being trusted —
see the long comment block at the top of `ThreeBattleRenderer.ts` for the full derivation.
Knock-on effects of this Y-negation, already handled, to remember if you add more geometry:

- Texture `flipY` should stay at its Three.js **default (`true`)** — do NOT set `flipY = false`.
  (An earlier, wrong attempt needed `false` under the broken inverted-frustum setup; the fixed
  setup needs the default.)
- Any `rotation.z` on a mesh needs its **sign negated** (`-rot * Math.PI / 3`, not `+`) to match
  `ctx.rotate()`'s on-screen clockwise-positive convention — see `ensureBuilt`/`syncDirtyTiles`.
- Custom geometry winding order needs checking: a naive fan-triangulation came out
  back-facing/culled under this camera setup — see `buildHexGeometry`'s comment on the
  `(0, i%6+1, i)` index order.

## Next step: static-pose units

Was mid-read of `BattleEngine.renderUnitsAndOverlays` (`src/game/engine.ts`, roughly lines
7734-8100+) when this session paused. What's there:

- `unitPixel(u)` (private, ~line 7115) gives the unit's current screen position, including move-
  animation interpolation via `u.drawX/drawY`. It's private, but `effectAnchor(col, row)`
  (public) gives the same world position for a plain single-hex unit — use
  `engine.effectAnchor(u.drawX, u.drawY)` for the new renderer instead of touching engine.ts
  again. This will be slightly wrong for multi-hex boss footprints (`unitPixel` averages a
  footprint centroid via `footprintCentroid`, which `effectAnchor` doesn't) — acceptable known
  gap for a first static-pose pass, flag it rather than silently fixing it by widening engine.ts
  private API further.
- `unitSize(u)` — exported from `src/game/pathfinding.ts`, just `Math.max(1, u.size || 1)`.
- Sprite box `w`/`h` (lines ~8005-8030 as of this session) is `cell * <size/boss multiplier> *
  1.2 * <big-creature correction> * spriteScale * <a long cascade of per-pose corrections>`. The
  per-pose corrections (`cultistV2Cast*`, `malrecWalk*`, `malrecAtk*`, `familiar2WalkScale`,
  `cultistV2WalkScale`, the `atk-27` one-off, etc.) all key off `atk`/`walk`/`casting` — **all
  false/null for a static idle pose**, so none of those apply yet. What DOES still apply
  regardless of pose, and needs porting: `spriteScale` (lancer 1.4, sandoval 1.2, familiar 0.5,
  kaelFinal 0.9, cultistV2 0.98, else 1), `familiar2WidthMul` (2.544 for sprite === "familiar2",
  else 1), `familiar3Scale` (1.4 for classId === "familiar3"), and the base
  `cell * (s>=4?3.35:s===2?1.72:boss?1.44:1.42) * 1.2 * (isBigCreatureFootprint?0.75:1)` (h) /
  the analogous `w` formula just above it in engine.ts.
- Facing/flip: `u.facing` (1|-1), with the `familiar`/`defaultWarrior` special-case negation
  (search `defaultWarriorIdleOrWalkReversed` near line 8065) — port as a mesh `scale.x` sign,
  same trick already used for decoration mirroring in `ensureDecorBuilt`.
- Art for a static idle frame: `u.idleAlt ? (art.idles2[u.sprite] ?? art.idles[u.sprite]) :
  art.idles[u.sprite]`, then just use frame `[0]` (or reuse `engine`'s existing `idleFrame(u, n)`
  if it's accessible — check before duplicating animation timing logic; a single static frame is
  fine for this first pass either way).
- Ground anchor / vertical offset: `footY = s >= 4 ? tile * 0.9 : cell * 0.42` (search `footY`),
  applied as `ctx.translate(px, py + footY + bob - lift)` — bob/lift are live idle-motion
  animation (`liveMotion`), fine to skip for a static first pass (use `footY` only).
- Depth sort vs decorations/other units: original code sorts by `u.drawY` then `u.drawX`
  (`sorted = [...this.units].sort(...)`, ~line 7791) before drawing back-to-front. In Three.js,
  don't sort — just give each unit mesh a Z derived from its row (e.g.
  `z = 2 + row * 0.001`, decorations are already at `z = 1`, tiles at `z = 0`) and let the depth
  buffer handle it, same pattern as decorations already use.
- **Units must end up on the SAME depth plane as ground/behind decorations** (i.e. added to
  `ThreeBattleRenderer`'s scene, not left on the old units canvas) for this to actually be
  "Milestone 1 done" — remember to also update `renderUnitsAndOverlays` again (another
  `skip...` bool, same pattern as `skipGroundDecor`) so units aren't double-drawn once they move
  here, and decide what happens to "front"-layer decorations (they need to stay above units, so
  either also move them into the Three scene at a higher Z once units are there, or leave them on
  the old canvas permanently — old canvas is transparent and stacks above the Three canvas, so
  leaving them there still occludes correctly even after units move).
- HP bars, hover/selection hex outline, portal FX: out of scope for "unit sprite parity" — can
  stay on the old canvas indefinitely unless the user asks for them explicitly; they're UI/overlay
  elements, not "asset positions."

## Testing — do not use the live browser

See the saved memory (`feedback_no_live_browser` in the memory system) — the user was explicit
and heated about this ("this is the last time you ever use my browser," "the browser does not
serve you as game testing tool," "the user will do it himself not I"). Always verify with a
throwaway headless Playwright script instead, following the pattern already used earlier this
session: `page.evaluate()` importing `/src/game/assets.ts`, `/src/game/engine.ts`,
`/src/game/data.ts` (for `TILE_CHAR`), and `/src/game/gfx/three/ThreeBattleRenderer.ts` directly,
constructing a minimal `BattleEngine` + mission by hand (see the git history of this session's
now-deleted `debug-three.mjs`/`debug-decor.mjs` scripts for the exact working pattern — they were
cleaned up after use, but the pattern is: create a detached `<canvas>`, construct the renderer,
call `.render()` a few times, then either `elementHandle.screenshot()` to a PNG under
`screenshots/` and read it, or draw the canvas into an offscreen 2D canvas and sample pixels via
`getImageData` for numeric assertions). Delete throwaway debug scripts/screenshots from the repo
root after use — don't leave them committed.

The dev server should already be running on `http://127.0.0.1:8080/` (`npm run dev`, per
`AGENTS.md`/`startup.sh` conventions) — check with `curl -s -o /dev/null -w "%{http_code}" ...`
before assuming a script needs to start one itself.

## Gate before calling anything done

`npm run typecheck && npm run build && npm run test` — all three must pass clean. All three
passed clean as of this handoff.
