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
- **Static-pose unit sprites** now render in `ThreeBattleRenderer` too (`syncUnits()`, called
  every frame from `render()` — units move/change art far more often than tiles/decor, so unlike
  `ensureBuilt`/`ensureDecorBuilt` there's no "build once" cache, just a persistent mesh per live
  unit id that's repositioned/retextured each frame). Only the idle frame `[0]` — no walk, attack,
  cast, counter poses, no bob/sway/breath motion, no fade-in opacity, and boss/multi-hex
  footprints anchor on `effectAnchor(u.drawX, u.drawY)` (a plain single-hex position) rather than
  the real footprint centroid `unitPixel` uses internally — see `unitPixel`'s doc and the
  `footprintCentroid` gap noted below in "Known gaps". Ported sizing keeps only the corrections
  that still apply to a static idle frame (`spriteScale`, `familiar2WidthMul`, `familiar3Scale`,
  the base size-tier `h`/`w` formula) — every walk/atk/cast-only correction in
  `BattleEngine.renderUnitsAndOverlays` (there are many — cultistV2 atk/cast scales, Malrec's
  walk/atk scales, the `atk-27` one-off, etc.) is intentionally left out, since none of them apply
  to an idle pose.
- `BattleEngine.unitHidden` is now public (was private) — `ThreeBattleRenderer.syncUnits` needs
  the same fog-of-war gate `renderUnitsAndOverlays` already applied internally.
- `BattleEngine.renderUnitsAndOverlays` got a second new param, `skipUnitSprites` (after
  `skipGroundDecor`), gating only the three `drawImageLit`/`drawImage` calls that paint the
  character art itself (the main draw plus the two glow-outline re-draws) — `BattleCanvas.tsx`
  passes `!!rendererThree` for this too now. Everything else in that per-unit loop (cast shadow,
  HP bar, level/heal glow backgrounds, status FX icons, the hover/selection hex outline, portal
  FX) is unaffected and keeps rendering on the old canvas exactly as before — see that param's
  doc comment in engine.ts for why each of those stays put.
- Verified visually via headless Playwright (not the live browser — see the testing section
  below): same mission (`Wisp Forest`, via Modo Teste → Debug → Classic Tactical), screenshotted
  once with `?renderer=three` and once without — unit count, formation, relative spacing, sprite
  scale, and facing all matched between the two renderers.

**Not done yet — the rest of Milestone 1:**

Unit **animation** (walk cycles, attack/cast/counter poses, the per-pose size corrections listed
above, bob/sway/breath idle motion, move interpolation, fade-in/out opacity) still only exists in
the old Canvas2D-shim path — units in the Three.js scene are static/idle-only right now, and
`skipUnitSprites` means the old canvas no longer draws them at all when `?renderer=three` is on,
so this is the visible gap if you compare the two renderers mid-combat rather than at rest. HP
bars, the hover/selection hex outline, portal FX, and "front"-layer decorations still render
entirely through the old Canvas2D-shim `unitsCanvas` (`WebGL2DRenderer`) on purpose — see the
`skipUnitSprites` bullet above — stacked above the Three.js canvas, unchanged, and currently
correct/working since that layer was never broken.

**Known gaps in the static-pose unit port (acceptable for this pass, not yet fixed):**

- Boss/multi-hex footprints (Troll, Horror, Asherah, ...) anchor slightly differently than the
  Canvas2D renderer's `footprintCentroid` (front-row average) — `effectAnchor` gives a plain
  single-hex position instead. Minor positional drift only on those few large-footprint units.
- No mid-move interpolation: `effectAnchor(u.drawX, u.drawY)` still reads the live
  animated draw position each frame, so a unit *slides* correctly, but its pose stays the static
  idle frame throughout — no walk cycle plays while it's sliding.

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

## Next step: unit animation (walk/attack/cast/counter poses)

Static-pose units are done (see the bullet list under "Where things stand right now" above) —
`ThreeBattleRenderer.syncUnits()` in `src/game/gfx/three/ThreeBattleRenderer.ts` is the place to
extend. What's left to reach real parity with `BattleEngine.renderUnitsAndOverlays`
(`src/game/engine.ts`, ~line 7740 on):

- **Pose selection**: `syncUnits` currently always reads the idle pool's frame `[0]`. The
  Canvas2D version picks `atk`/`cast`/`counter`/`walk`/`idle` pools based on `engine.attackPose(u)`
  (private), `this.active` (whether a move/spell/heal/combat action is live for this unit),
  and `u.idleAlt`/`u.facing` — see the `frames`/`fi`/`img` computation around what's now
  engine.ts's `renderUnitsAndOverlays`. Most of that state (`this.active`, `attackPose`) is
  private to `BattleEngine`; either add narrow public accessors (same pattern as `unitHidden`)
  or a single public method that returns "what pose/frame index is this unit on right now" so
  `ThreeBattleRenderer` doesn't have to duplicate the animation-timing logic (`walkFrame`,
  `idleFrame`, `attackPose` are all private and non-trivial — reuse them, don't reimplement).
- **The per-pose size corrections** intentionally left out of the static pass (see "Known gaps"
  above): `cultistV2CastHeightMul`/`WidthMul`, `cultistV2AtkScale`, `malrecWalkHeightScale`/
  `WidthScale`, `malrecAtkScale`, `malrecAtkFrame27WidthScale`, `cultistV2WalkScale`,
  `familiar2WalkScale`, `cultistV2CastFootOffset` — all keyed off `atk`/`walk`/`casting`/`fi`,
  ported verbatim from the same block in `renderUnitsAndOverlays` once pose selection exists.
- **Live idle motion** (`bob`/`sway`/`breath` via `this.liveMotion(u, cell)`, private) and
  **move interpolation pose** (a unit sliding between hexes should play its walk cycle, not just
  slide while idle) — `unitLift` (high-ground lift) is the other private piece already skipped.
- Once poses/animation are ported, re-verify the "Known gaps" list above (footprint centroid,
  fade opacity) is still the full list of remaining deltas — don't let a new gap join it unnoticed.
- HP bars, hover/selection hex outline, portal FX: still out of scope — stay on the old canvas
  indefinitely unless the user asks for them explicitly; they're UI/overlay elements, not
  "asset positions."

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
