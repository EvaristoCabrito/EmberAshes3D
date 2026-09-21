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

## Old atmosphere system — unwired again, do not re-enable

`src/game/gfx/AtmosphereRenderer.ts`, `atmosphereShaders.ts`, `atmosphereParams.ts` are a
fullscreen-2D-overlay global lighting system (ambient wash, drifting light field, procedural
haze, volumetric shafts, dust, bloom, grading) from before this migration decision — separate
from the Three.js work above. The user explicitly rejected the overlay approach on visual
grounds ("does not convincingly occupy the game world... flat image with a moving filter over
it") when redirecting to Three.js instead; it later got built and shipped anyway as `AtmosphereFX`
(commit `06a6319` on), then reported to break the game badly enough in play that every reference
to it — the `atmosphereFxOn` HUD toggle, its Options-menu button, and the point-light shader
plumbing in `WebGL2DRenderer`/`EffectsRenderer` that fed it — was stripped back out. The three
files themselves are kept in the tree on purpose, unreferenced (the user does not want them
deleted, just never wired back in) — do not wire them into anything, do not spend time improving
them. Milestones 2/3 will use Three.js's own `DirectionalLight`, fog, and particle systems
instead, built fresh against the new scene from this migration — do not resurrect the old overlay
approach for those.

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
- **Unit sprites now animate in `ThreeBattleRenderer`** with full pose parity, not just a static
  idle frame. `BattleEngine.computeUnitVisual` (private) is the single computation both
  `renderUnitsAndOverlays`'s Canvas2D draw loop and `ThreeBattleRenderer.syncUnits` now call —
  pose selection (idle/walk/atk/cast/counter), every pose-specific size correction (cultistV2's
  atk/cast scales, Malrec's walk/atk scales and the `atk-27` one-off, familiar2's walk scale,
  etc.), live idle motion (bob/sway/breath), and high-ground lift are all computed once and
  shared, so the two renderers can't drift out of sync into two copies of this logic.
  `BattleEngine.unitVisual(u, tile)` is the public wrapper `ThreeBattleRenderer` calls every
  frame (`syncUnits()`, called from `render()` — units change art/pose far more often than
  tiles/decor, so unlike `ensureBuilt`/`ensureDecorBuilt` there's no "build once" cache, just a
  persistent mesh per live unit id repositioned/retextured/rescaled each frame). The `UnitVisual`
  interface (exported near the top of engine.ts) is the exact shape passed between them: `img`,
  `w`/`h`, `footY`, `bob`/`sway`/`breath`/`lift`, the `scaleX`/`scaleY` ctx.scale() factors, and
  `footOffset` (cultistV2's cast-pose foot correction). `ThreeBattleRenderer.syncUnits`'s own
  comment on `centerYLocal` explains the one non-obvious geometry translation: Canvas2D's
  `ctx.scale(scaleX, scaleY)` stretches the sprite's box AWAY FROM the unit's anchor point
  (y=0 locally, i.e. its feet), not around the box's own center, so the Three mesh's position has
  to be re-derived by that same scale rather than just resizing the mesh in place — get this
  wrong and the breath-scaled sprites drift from their feet, small but real.
- `BattleEngine.unitHidden` is now public (was private) — `ThreeBattleRenderer.syncUnits` needs
  the same fog-of-war gate `renderUnitsAndOverlays` already applied internally.
- `BattleEngine.renderUnitsAndOverlays` got a second new param, `skipUnitSprites` (after
  `skipGroundDecor`), gating only the three `drawImageLit`/`drawImage` calls that paint the
  character art itself (the main draw plus the two glow-outline re-draws) — `BattleCanvas.tsx`
  passes `!!rendererThree` for this too now. Everything else in that per-unit loop (cast shadow,
  HP bar, level/heal glow backgrounds, status FX icons, the hover/selection hex outline, portal
  FX) is unaffected and keeps rendering on the old canvas exactly as before — see that param's
  doc comment in engine.ts for why each of those stays put.
- **Correct anchor position for every unit, boss/multi-hex included, plus real per-unit fade
  opacity** — the two gaps this doc used to list here are both closed:
  - `BattleEngine.unitAnchor(u)` is a new public method, the world-space (camera-independent)
    twin of the private `unitPixel`/`footprintCentroid` the Canvas2D path actually draws with —
    including their front-row-footprint averaging for boss/multi-hex creatures (Troll, Horror,
    Asherah, ...) and their mid-move easing. `footprintCentroidWorld` (private) is the
    world-space twin of `footprintCentroid` itself, same relationship `effectAnchor` already has
    to `hexCenter`. `ThreeBattleRenderer.syncUnits` now calls `unitAnchor` instead of
    `effectAnchor(u.drawX, u.drawY)`, which fixes the boss-footprint drift and, as a side effect,
    is now MORE correct than the old approach even for ordinary single-hex units — `unitAnchor`
    mirrors the exact interpolation `unitPixel` drives the Canvas2D sprite with, where
    `u.drawX/drawY` was always only an approximation of that.
  - Unit meshes each get their own `THREE.MeshBasicMaterial` now (sharing the underlying
    `THREE.Texture` by image via `unitTexCache`, same cheap-sharing idea tiles/decor use, just
    one level down) instead of sharing a material by image outright — see `UnitMeshEntry`'s doc
    comment for why a shared material made fade-in/out impossible the instant two units sharing
    one sprite frame needed different opacity at once. `entry.material.opacity` is now set every
    frame straight from `u.fade * (u.moved && side==="player" && phase==="player" ? 0.8 : 1)`,
    the exact same expression `renderUnitsAndOverlays`' `ctx.globalAlpha` uses.
- Verified visually via headless Playwright (not the live browser — see the testing section
  below): same mission (`Wisp Forest`, via Modo Teste → Debug → Classic Tactical), screenshotted
  once with `?renderer=three` and once without at rest — unit count, formation, relative spacing,
  sprite scale, and facing all matched — then burst-screenshotted a live attack (and separately a
  fresh combat entry after the fade-opacity change) on the Three.js path to confirm pose
  switching and damage popups run with no console errors and no broken/placeholder frames.

**Not done — deliberately out of scope, not a gap:**

HP bars, the hover/selection hex outline, portal FX, and "front"-layer decorations still render
entirely through the old Canvas2D-shim `unitsCanvas` (`WebGL2DRenderer`) on purpose — see the
`skipUnitSprites` bullet above — stacked above the Three.js canvas, unchanged, and currently
correct/working since that layer was never broken. Deciding whether those ever move into the
Three scene (and what "front"-layer decorations do once units are fully there) is optional
polish for later, not required for "Milestone 1 done."

**Milestone 1 is now done** by its own gating definition at the top of this doc (terrain +
decorations + units + camera + mouse interaction, matching the existing renderer) — the next
session's job is Milestone 2 (lighting/shadows), not more unit-parity work, unless the user finds
a concrete mismatch this doc's testing missed.

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

## Next step: Milestone 2 (lighting/shadows)

Milestone 1 is done — see "Milestone 1 is now done" above. This doc's job (a handoff note, not
permanent documentation — see the top of this file) is finished; read the "Goal" section's
Milestone 2 scope (real `DirectionalLight`/shadows against the world-space scene this milestone
built) before starting it, confirm with the user this doc's claim of "done" still holds after
however long has passed since it was written, and then delete this file per its own opening line.

## Testing — do not use the live browser

See the saved memory (`feedback_no_live_browser` in the memory system) — the user was explicit
and heated about this ("this is the last time you ever use my browser," "the browser does not
serve you as game testing tool," "the user will do it himself not I"). Always verify with a
throwaway headless Playwright script instead — the script must live under the project root (or
be copied there before running) so Node resolves the `playwright` package from its
`node_modules`; running it from an outside scratch directory fails with `ERR_MODULE_NOT_FOUND`.

Two patterns have worked so far, pick whichever fits what's being checked:

1. **Hand-built engine** (used for terrain/decor in an earlier session — see git history of this
   session's now-deleted `debug-three.mjs`/`debug-decor.mjs` scripts for the exact pattern):
   `page.evaluate()` importing `/src/game/assets.ts`, `/src/game/engine.ts`, `/src/game/data.ts`,
   and `/src/game/gfx/three/ThreeBattleRenderer.ts` directly, constructing a minimal
   `BattleEngine` + mission by hand, a detached `<canvas>`, calling `.render()` a few times, then
   either `elementHandle.screenshot()` to a PNG and reading it, or sampling pixels via
   `getImageData` for numeric assertions. More precise for numeric checks, more setup.
2. **Drive the real UI** (used this session to verify units — much less setup, good for a visual
   parity check): navigate to `http://127.0.0.1:8080/?renderer=three` (or without the param for
   the Canvas2D path to compare against), click through `Modo teste` (bottom-left corner of the
   title screen) → `Debug` → `Classic Tactical` → click a mission pin with combat (the Inn pin
   has no `Entrar em combate` button — pick a different one, e.g. `Wisp Forest`) → `Entrar em
   combate`, wait ~2.5s for the battle to mount, then screenshot. Compare screenshots between
   `?renderer=three` and no param for the same mission pin to check parity directly.

Delete throwaway debug scripts/screenshots from the repo root after use — don't leave them
committed.

The dev server should already be running on `http://127.0.0.1:8080/` (`npm run dev`, per
`AGENTS.md`/`startup.sh` conventions) — check with `curl -s -o /dev/null -w "%{http_code}" ...`
before assuming a script needs to start one itself.

## Gate before calling anything done

`npm run typecheck && npm run build && npm run test` — all three must pass clean. All three
passed clean as of this handoff.
