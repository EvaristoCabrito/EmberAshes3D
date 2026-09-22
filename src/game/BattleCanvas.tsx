import { useEffect, useRef } from "react";
import type { BattleEngine } from "./engine";
import { EffectsRenderer } from "./gfx/EffectsRenderer";
import { WebGL2DRenderer } from "./gfx/WebGL2DRenderer";
import { ThreeBattleRenderer } from "./gfx/three/ThreeBattleRenderer";
import type { HudSnapshot } from "./types";

/** Three.js is now the default ground/terrain renderer (see ThreeBattleRenderer's module
 * comment) — everything else (elemental FX, units, HP bars, hover/selection highlight,
 * decorations, mouse interaction) is untouched either way. `?renderer=legacy` falls back to the
 * old Canvas2D-shim WebGL renderer for comparison while the migration is still being verified. */
function useThreeGroundRenderer(): boolean {
  if (typeof window === "undefined") return true;
  return new URLSearchParams(window.location.search).get("renderer") !== "legacy";
}

export function BattleCanvas({
  engine,
  onHud,
  paused = false,
  onTileReadout,
}: {
  engine: BattleEngine;
  onHud: (hud: HudSnapshot) => void;
  paused?: boolean;
  /** Fires when the pointer has settled on one tile long enough to be asking about it, so
   * the caller can show what that terrain does. With a mouse that is the cursor resting
   * still; on touch, where there is no hover, it is a press held in place. Called with
   * false as soon as the pointer moves off, lifts, or leaves the canvas. */
  onTileReadout?: (showing: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const unitsCanvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hudKey = useRef("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const threeGround = useThreeGroundRenderer();
    // Exactly one of these two is ever non-null for the lifetime of this effect — see
    // useThreeGroundRenderer's comment. Both expose just enough surface (a resize call and a
    // per-frame draw call) that the rest of this component barely has to branch on which one
    // it's holding.
    let renderer2D: WebGL2DRenderer | null = null;
    let rendererThree: ThreeBattleRenderer | null = null;
    try {
      if (threeGround) rendererThree = new ThreeBattleRenderer(canvas, engine);
      else renderer2D = new WebGL2DRenderer(canvas);
    } catch {
      return;
    }
    // Units, HP bars, particles and foreground decorations get their own transparent canvas
    // stacked ABOVE the FX canvas (see below), instead of being part of the ground canvas the
    // FX layer reads as its "scene" — otherwise a unit or decoration standing on/near a Water
    // placement would already be baked into that snapshot, and the FX canvas (a separate DOM
    // layer stacked on top of everything) would paint straight over it every frame regardless
    // of draw order. Splitting the ground and unit passes onto their own canvases (see
    // BattleEngine.renderGround/renderUnitsAndOverlays) puts a real layer boundary between them.
    const unitsCanvas = unitsCanvasRef.current;
    let unitsRenderer: WebGL2DRenderer | null = null;
    if (unitsCanvas) {
      try {
        unitsRenderer = new WebGL2DRenderer(unitsCanvas);
      } catch {
        unitsRenderer = null;
      }
    }
    (window as Window & { __emberEngine?: BattleEngine }).__emberEngine = engine;

    // Permanent map-authored elemental FX (lava fire, icy glints, ...) placed in the editor's
    // "FX" mode — a WebGL2 overlay that uploads the ground canvas as its "scene" texture and
    // draws the placements on top of the ground only; units/overlays are drawn afterward on
    // their own canvas above this one. Nothing to do with spell casting: it only ever plays
    // what the map author placed. Degrades to plain 2D (this canvas stays visible, overlay
    // hidden) if WebGL2 isn't available.
    let fx: EffectsRenderer | null = null;
    const fxCanvas = fxCanvasRef.current;
    if (fxCanvas) {
      try {
        fx = new EffectsRenderer(fxCanvas);
        for (const p of engine.elementalFxPlacements) fx.spawnEffect(p.kind, p.x, p.y, { radiusTiles: p.radiusTiles, rotation: p.rotation });
      } catch {
        fx = null;
        fxCanvas.style.display = "none";
      }
    }

    // Dreaming Web's travelling shot, unlike every other elemental FX here, is spawned/
    // despawned live as the spell itself plays out rather than once at mount from an editor-
    // authored placements list — see the sync inside loop() below. The zone's own persistent
    // floor patch is a real alpha-photo image stamped per-hex in BattleEngine.renderGround now
    // (GameArt.webfloor), not a WebGL effect this canvas owns.
    let webShotId: number | null = null;

    let raf = 0;
    let last = performance.now();
    let running = true;
    let dragging = false;
    let dragged = false;
    let mouseDown = false;
    let lastX = 0;
    let lastY = 0;
    // Mouse hold-and-grab-to-pan: the button must stay down this long before a drag counts
    // as panning, so a quick click near a unit/tile never gets swallowed by a small
    // incidental jitter. mouseStartX/Y anchor the "moved far enough since the press" check;
    // lastX/Y (above) are updated every move so the pan itself only ever applies one frame's
    // delta, never a jump built up while waiting to arm.
    const MOUSE_PAN_HOLD_MS = 650;
    let mouseArmed = false;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let mouseHoldTimer: number | null = null;
    const held = new Set<string>();
    const pointers = new Map<number, { x: number; y: number }>();
    // Press-and-hold on a tile reads out its terrain. It has to coexist with dragging the
    // camera, so the timer is armed on every press and cancelled the moment the pointer
    // travels far enough to count as a pan.
    let holdTimer: number | null = null;
    let holding = false;
    const cancelHold = () => {
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
      if (holding) {
        holding = false;
        onTileReadout?.(false);
      }
    };
    const armReadout = (px: number, py: number, delay: number) => {
      cancelHold();
      if (paused) return;
      holdTimer = window.setTimeout(() => {
        holdTimer = null;
        holding = true;
        engine.pointerMove(px, py); // point the hover at that tile so the HUD describes it
        onTileReadout?.(true);
      }, delay);
    };
    let pinchDist = 0;
    let pinched = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (rendererThree) {
        // Owns canvas.width/height itself (device pixels, via its own dpr bookkeeping) —
        // see ThreeBattleRenderer.setSize.
        rendererThree.setSize(w, h, dpr);
      } else if (renderer2D) {
        canvas.width = pw;
        canvas.height = ph;
        renderer2D.setSize(pw, ph);
      }
      if (fxCanvas) {
        fx?.resize(w, h, dpr);
        fxCanvas.style.width = `${w}px`;
        fxCanvas.style.height = `${h}px`;
      }
      if (unitsCanvas && unitsRenderer) {
        unitsCanvas.width = pw;
        unitsCanvas.height = ph;
        unitsCanvas.style.width = `${w}px`;
        unitsCanvas.style.height = `${h}px`;
        unitsRenderer.setSize(pw, ph);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!paused) {
        const speed = 520;
        let px = 0;
        let py = 0;
        if (held.has("ArrowLeft") || held.has("KeyA")) px -= 1;
        if (held.has("ArrowRight") || held.has("KeyD")) px += 1;
        if (held.has("ArrowUp") || held.has("KeyW")) py -= 1;
        if (held.has("ArrowDown") || held.has("KeyS")) py += 1;
        if (px || py) {
          const mag = Math.hypot(px, py) || 1;
          engine.panBy((px / mag) * speed * dt, (py / mag) * speed * dt);
        }
        engine.tick(dt);
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (rendererThree) {
        // Movement/attack/spell-range highlight and the active-turn ring are drawn as part of
        // this call now (see ThreeBattleRenderer.syncOverlay) — real world-space hex meshes
        // ordered between terrain and decorations, not a separate 2D overlay, so a blocking
        // decoration or a unit standing on a highlighted hex stays visible on top of it instead
        // of the highlight's tint painting over it.
        rendererThree.render(wrap.clientWidth, wrap.clientHeight);
      } else if (renderer2D) {
        renderer2D.clear();
        engine.renderGround(renderer2D, wrap.clientWidth, wrap.clientHeight, dpr);
      }
      if (fx) {
        // Dreaming Web's shot: one "webShot" beam, repositioned every frame via updateOverride
        // to follow the travelling missile's own timing (see BattleEngine.webShotBeam) — it
        // can't use the fixed getAnchor(col,row) model every other effect here relies on.
        const beam = engine.webShotBeam();
        if (beam) {
          if (webShotId === null) webShotId = fx.spawnEffect("webShot", 0, 0, { radiusTiles: 0.01 });
          fx.updateOverride(webShotId, {
            x: beam.x,
            y: beam.y,
            worldX: beam.worldX,
            worldY: beam.worldY,
            tile: beam.tile,
            halfLengthPx: Math.max(1, beam.length / 2),
            // Wide enough that the tangled multi-strand shader (see shaders.ts's WEB_SHOT,
            // whose strands spread out to about |v_local.y| = 0.85 near the tail) actually
            // reads as a comet-like cluster instead of a thin line.
            halfWidthPx: beam.tile * 0.4,
            rotation: beam.angle,
          });
        } else if (webShotId !== null) {
          fx.removeEffect(webShotId);
          webShotId = null;
        }
        // Spell-cast elemental FX: one-shot WebGL shader bursts a landed fire/acid/lightning/
        // holy hit queues on the engine (see BattleEngine.queueElementalFx/elementalFxRequests)
        // since `fx` only exists in this closure. Each carries its own duration and self-expires
        // in EffectsRenderer, so draining the queue here is all this loop needs to do.
        if (engine.elementalFxRequests.length) {
          for (const req of engine.elementalFxRequests.splice(0)) {
            fx.spawnEffect(req.kind, req.x, req.y, { duration: req.duration });
          }
        }
        // Skip the rest of the FX pipeline (scene upload, light/effects/bloom FBO passes)
        // whenever nothing — editor-placed or live spell FX — is actually active, so an
        // ordinary fight never pays for it.
        if (fx.hasEffects()) {
          if (fxCanvas) fxCanvas.style.display = "block";
          fx.render(canvas, dt, (col, row) => engine.effectAnchor(col, row));
        } else if (fxCanvas) {
          fxCanvas.style.display = "none";
        }
      }
      // Drawn on its own transparent canvas above the FX layer, so units/HP-bars/foreground
      // decorations always read in front of a Water/Fire/etc placement instead of being
      // whatever the FX's snapshot happened to catch underneath it.
      if (unitsRenderer && unitsCanvas) {
        unitsRenderer.setTransform(dpr, 0, 0, dpr, 0, 0);
        unitsRenderer.clear();
        engine.renderUnitsAndOverlays(
          unitsRenderer,
          wrap.clientWidth,
          wrap.clientHeight,
          fx ? (px: number, py: number) => fx.lightBoostAt(px, py, (col, row) => engine.effectAnchor(col, row)) : undefined,
          // ThreeBattleRenderer already draws ground/behind decorations AND unit sprites
          // itself — see its module comment and renderUnitsAndOverlays' skipGroundDecor/
          // skipUnitSprites docs. It now casts a real shadow too (MILESTONE 2) — skip the old
          // fake ellipse so the two don't double up (see skipUnitShadow's own doc).
          !!rendererThree,
          !!rendererThree,
          !!rendererThree,
          !!rendererThree,
        );
      }
      const hud = engine.getHud();
      const k = [
        hud.mode,
        hud.phase,
        hud.selected?.id,
        hud.canAttack,
        hud.banner,
        hud.result,
        hud.turn,
        hud.playerAlive,
        hud.enemyAlive,
        hud.forecast?.defender,
        hud.forecast?.dmgOut,
        hud.inspected?.id,
        hud.pendingFoe?.id,
        hud.selected?.hp,
        hud.selected?.fullness,
        hud.inspected?.fullness,
        hud.inspected?.hp,
        hud.selected?.bag.mid,
        hud.selected?.bag.weak,
        hud.selected?.bag.potent,
        hud.selected?.bag.disease,
        hud.tip,
        // Terrain inspection changes while the cursor rests over the board. It must be part
        // of the HUD identity; otherwise React keeps the first hovered hex (usually plains)
        // even though the engine has already resolved the actual tile underneath the cursor.
        hud.terrain
          ? `${hud.terrain.id}:${hud.terrain.name}:${hud.terrain.moveCost}:${hud.terrain.def}:${hud.terrain.atk}:${hud.terrain.passable ? 1 : 0}:${hud.terrain.blocksShot ? 1 : 0}:${hud.terrain.hazard ?? ""}:${hud.terrain.note ?? ""}:${hud.terrain.spellZone ? `${hud.terrain.spellZone.kind}:${hud.terrain.spellZone.roundsLeft}` : ""}`
          : "no-terrain",
        hud.zoom,
        hud.speedMode,
        hud.winAvailable,
        hud.spellReady,
        hud.turnQueue.find((q) => q.active)?.id,
        hud.turnQueue.map((q) => (q.acted ? "1" : "0")).join(""),
        hud.chestLoot ? `${hud.chestLoot.unitName}:${hud.chestLoot.ember}:${hud.chestLoot.items.map((i) => i.name).join(",")}` : null,
        hud.pendingDialog ? `${hud.pendingDialog.id}` : null,
      ].join("|");
      if (k !== hudKey.current) {
        hudKey.current = k;
        onHud(hud);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      if (paused) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const p = pos(e);
      if (e.pointerType === "mouse") {
        if (engine.getHud().mode === "awaitSpell") {
          engine.pointerDown(p.x, p.y, "click");
          return;
        }
        // Deferred to pointerup, same as touch: a held-and-dragged mouse pans the
        // camera (see onMove/onUp) instead of immediately acting on the down-press.
        mouseDown = true;
        dragging = true;
        dragged = false;
        mouseArmed = false;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
        if (mouseHoldTimer !== null) window.clearTimeout(mouseHoldTimer);
        mouseHoldTimer = window.setTimeout(() => {
          mouseHoldTimer = null;
          mouseArmed = true;
        }, MOUSE_PAN_HOLD_MS);
        return;
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture(e.pointerId);
      if (pointers.size >= 2) {
        const pts = [...pointers.values()];
        pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinched = true;
        dragging = false;
        dragged = true;
        return;
      }
      dragging = true;
      dragged = false;
      lastX = e.clientX;
      lastY = e.clientY;
      armReadout(p.x, p.y, 420);
      if (engine.getHud().mode === "awaitSpell") {
        engine.pointerMove(p.x, p.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2 && pinchDist > 0) {
        const pts = [...pointers.values()];
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (d > pinchDist * 1.22) {
          engine.cycleZoom(1);
          pinchDist = d;
        } else if (d < pinchDist * 0.82) {
          engine.cycleZoom(-1);
          pinchDist = d;
        }
        return;
      }
      const p = pos(e);
      const spell = engine.getHud().mode === "awaitSpell";
      // Resting the cursor on a tile asks about it. Every movement restarts the clock, so
      // this only fires once the pointer actually stops — no button involved.
      if (e.pointerType === "mouse" && !mouseDown) armReadout(p.x, p.y, 650);
      if (e.pointerType === "mouse" && mouseDown) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (!dragged && mouseArmed && Math.hypot(e.clientX - mouseStartX, e.clientY - mouseStartY) > 3) {
          dragged = true;
          cancelHold();
        }
        if (dragged) engine.panBy(-dx, -dy);
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      if (dragging && e.pointerType !== "mouse" && !spell) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (Math.abs(dx) + Math.abs(dy) > 3) {
          dragged = true;
          cancelHold();
        }
        if (dragged) {
          engine.panBy(-dx, -dy);
          lastX = e.clientX;
          lastY = e.clientY;
        }
      } else {
        if (dragging && e.pointerType !== "mouse" && spell) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          if (Math.abs(dx) + Math.abs(dy) > 10) dragged = true;
        }
        engine.pointerMove(p.x, p.y);
      }
    };
    const onUp = (e: PointerEvent) => {
      const wasHolding = holding;
      cancelHold();
      if (e.pointerType === "mouse") {
        canvas.style.cursor = "";
        if (mouseHoldTimer !== null) {
          window.clearTimeout(mouseHoldTimer);
          mouseHoldTimer = null;
        }
        mouseArmed = false;
        if (!mouseDown) return;
        mouseDown = false;
        dragging = false;
        if (!dragged && !paused && !wasHolding) {
          const p = pos(e);
          engine.pointerDown(p.x, p.y, "click");
        }
        dragged = false;
        return;
      }
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pinched) {
        if (pointers.size === 0) pinched = false;
        dragging = false;
        return;
      }
      if (!dragging) return;
      dragging = false;
      if (!dragged && !paused && !wasHolding) {
        const p = pos(e);
        engine.pointerDown(p.x, p.y, "tap");
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      engine.cycleZoom(e.deltaY > 0 ? -1 : 1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (paused) return;
      const trap = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Space",
        "Enter",
        "Escape",
        "KeyE",
        "KeyZ",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
      ];
      if (trap.includes(e.code)) e.preventDefault();
      held.add(e.code);
      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD"
      ) {
        return;
      }
      engine.keyDown(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      held.delete(e.code);
    };

    const onMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (paused) return;
      const hud = engine.getHud();
      const showAct =
        hud.mode === "awaitAction" || hud.mode === "awaitAttack" || hud.mode === "selected" || hud.mode === "awaitSpell";
      if (!showAct || hud.busy) return;
      engine.cancel();
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", cancelHold);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", onMenu);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      cancelHold();
      if (mouseHoldTimer !== null) window.clearTimeout(mouseHoldTimer);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", cancelHold);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onMenu);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
      const w = window as Window & { __emberEngine?: BattleEngine };
      if (w.__emberEngine === engine) delete w.__emberEngine;
      fx?.dispose();
      rendererThree?.dispose();
    };
  }, [engine, onHud, paused]);

  // Mission.mistType === "vignette" (Map Editor's "Tipo de névoa") turns this from the always-on
  // subtle diorama edge shading into an author-controlled hazy corner effect, driven by the same
  // Névoa slider/intensity that would otherwise drive the world-space mist systems — see
  // ThreeAtmosphere.ts's own comment on why "vignette" forces both of those to zero instead of
  // stacking with this. Screen-space, tied to the viewport rather than world position, so the
  // center (where the actual battle happens) is always guaranteed clear by construction — it
  // never grows past clearRadius no matter how high intensity goes.
  const isVignetteMist = engine.mission.mistType === "vignette";
  const vignetteIntensity = engine.mission.mistIntensity ?? 0.5;
  // Recalibrated per direct feedback: this must read as decoration on the extreme edges/corners,
  // not something that blocks meaningfully into the battlefield. Even at max intensity the clear
  // radius only pulls back to 74% (was 38%) — only the outermost sliver near the screen edges is
  // ever affected, and the peak alpha is much lower too (was up to 0.92, now capped at 0.5).
  const vignetteAlpha = isVignetteMist ? Math.min(0.5, 0.08 + vignetteIntensity * 0.32) : 0.4;
  const vignetteClearRadius = isVignetteMist ? Math.max(74, 92 - vignetteIntensity * 18) : 52;

  return (
    <div ref={wrapRef} className="relative h-full w-full min-h-0 touch-none">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
      <canvas ref={fxCanvasRef} className="pointer-events-none absolute inset-0 block h-full w-full touch-none" style={{ display: "none" }} />
      <canvas ref={unitsCanvasRef} className="pointer-events-none absolute inset-0 block h-full w-full touch-none" />
      {/* Diorama color grade + vignette: a subtle warm key-light / cool shadow wash from the
          same upper-left "sun" the unit/decoration relighting and cast shadows use (see
          WebGL2DRenderer's lightDirX/Y and BattleEngine's shadowDirX/Y), plus a soft edge
          vignette. Pure CSS, above every game canvas, non-interactive, and gentle enough
          (soft-light / multiply, low alpha) to never wash out the art or UI underneath. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,208,150,0.16) 0%, rgba(255,208,150,0) 32%, rgba(48,58,92,0) 55%, rgba(40,52,88,0.22) 100%)",
          mixBlendMode: "soft-light",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(130% 130% at 50% 42%, transparent ${vignetteClearRadius}%, rgba(4,5,10,${vignetteAlpha}) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      {/* The layer above only darkens — it reads as shadow, not haze. Everything below adds
          actual moving depth: two counter-rotating, blurred conic-gradient swirls (screen-
          blended, so they lighten/wash out rather than darken) plus a slow drift/breathing
          pulse — "spirals descending" rather than a flat static tint. A radial CSS mask keeps
          it strictly confined to the same corner region as the darkening layer above, so the
          center stays exactly as clear regardless of how the swirl itself is animating. Only
          rendered for mistType==="vignette"; never touches the default diorama look or Mist 2/3
          (those are Three.js world-space systems in ThreeAtmosphere.ts, untouched here). */}
      {isVignetteMist && (
        <>
          <style>{`
            @keyframes vignetteVortexA { from { transform: rotate(0deg) scale(1.2); } to { transform: rotate(360deg) scale(1.2); } }
            @keyframes vignetteVortexB { from { transform: rotate(0deg) scale(1.35); } to { transform: rotate(-360deg) scale(1.35); } }
            @keyframes vignetteVortexDrift { 0%, 100% { transform: translateY(0%) scale(1); } 50% { transform: translateY(3%) scale(1.05); } }
          `}</style>
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              WebkitMaskImage: `radial-gradient(130% 130% at 50% 42%, transparent ${vignetteClearRadius}%, black 100%)`,
              maskImage: `radial-gradient(130% 130% at 50% 42%, transparent ${vignetteClearRadius}%, black 100%)`,
              // THE BUG: mix-blend-mode was on the CHILDREN below, but this element's own
              // mask-image creates an isolated stacking context — a child's blend mode can only
              // blend with what's painted inside that same isolated context (its siblings here),
              // never with the actual game canvas behind it, so the whole effect silently
              // composited as if invisible. Moving blend-mode to THIS wrapper instead: its two
              // children first normal-composite together inside it, then this one wrapper blends
              // the combined result against the canvas — reaches through correctly.
              mixBlendMode: "screen",
            }}
          >
            <div
              className="absolute"
              style={{
                inset: "-35%",
                background:
                  "conic-gradient(from 0deg at 50% 50%, rgba(196,204,198,0.38) 0deg, rgba(196,204,198,0) 70deg, rgba(196,204,198,0.3) 150deg, rgba(196,204,198,0) 230deg, rgba(196,204,198,0.34) 300deg, rgba(196,204,198,0) 360deg)",
                opacity: Math.min(1, 0.4 + vignetteIntensity * 0.7),
                filter: "blur(7px)",
                // Faster swirl at higher intensity — the "max means max" standard every other
                // slider tonight was held to, not just a static image that gets paler/darker.
                animation: `vignetteVortexA ${Math.max(14, 42 - vignetteIntensity * 24)}s linear infinite`,
              }}
            />
            <div
              className="absolute"
              style={{
                inset: "-35%",
                background:
                  "conic-gradient(from 90deg at 48% 54%, rgba(168,178,172,0.3) 0deg, rgba(168,178,172,0) 90deg, rgba(168,178,172,0.26) 200deg, rgba(168,178,172,0) 300deg)",
                opacity: Math.min(1, 0.3 + vignetteIntensity * 0.6),
                filter: "blur(11px)",
                animation: `vignetteVortexB ${Math.max(20, 56 - vignetteIntensity * 28)}s linear infinite, vignetteVortexDrift 8s ease-in-out infinite`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
