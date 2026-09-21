/** MILESTONE 1 — rendering parity only. Draws the battlefield's terrain grid through a real
 * Three.js scene instead of the Canvas2D-shim WebGL renderer, as the first slice of migrating
 * the battlefield to a genuine spatial rendering environment (see the architecture note below).
 * No lighting, no atmosphere, no fog, no bloom, no particles here — those are later milestones,
 * built once this foundation is confirmed solid. Ground/behind-layer decorations (trees,
 * houses, rubble, ...) render here too (see ensureDecorBuilt); "front"-layer/foreground props
 * and every unit sprite still render through the existing Canvas2D-shim units canvas,
 * unchanged, stacked on top — this renderer replaces the ground/terrain canvas and the props
 * that belong under a unit, never anything meant to draw in front of one (see BattleCanvas.tsx).
 *
 * ARCHITECTURE: every tile mesh is built ONCE at its fixed WORLD position (the same formula
 * BattleEngine.effectAnchor already uses for worldX/worldY) and never moves again. Camera
 * panning moves the CAMERA, not the tiles — a real spatial scene, not screen-space coordinates
 * recomputed every frame. This is what makes later milestones (real DirectionalLight/shadows,
 * world-space fog, depth-sorted particles) possible without another rewrite: every tile has an
 * actual, stable position in a 3D world a light or a fog volume can reason about.
 *
 * COORDINATE CONVENTION: the orthographic camera's frustum is a STANDARD (left=0, right=cssW,
 * top=cssH, bottom=0) one — top > bottom, the normal orientation. An orthographic camera with
 * an inverted frustum (top < bottom), which is what a naive "world Y increases down the screen"
 * port of BattleEngine's cx/cy convention would want, renders nothing at all in this Three.js
 * version (confirmed empirically: identical scene/camera/mesh renders correctly with a standard
 * frustum and renders nothing with an inverted one, regardless of camera or mesh position —
 * some part of the projection/clipping pipeline silently assumes top > bottom). So the Y-flip
 * BattleEngine's convention needs happens elsewhere instead: every mesh is placed at Y = -wy
 * (see hexWorld) rather than +wy, and the camera's own Y position is offset by -camY - cssH to
 * match. Both are derived once, together, in render()/ensureBuilt() — verified numerically
 * against BattleEngine's own cx/cy formula, not just visually. This still lets every other
 * system (mouse picking via BattleEngine.cellAt, hover/selection highlighting, unit sprites on
 * the Canvas2D-shim units canvas, panBy/zoom) keep working completely unchanged: they all
 * operate in CSS-pixel space, which this renderer's on-screen RESULT still matches exactly —
 * only the intermediate Three.js coordinates carry the flip, nothing outside this file does. */

import * as THREE from "three";
import type { BattleEngine } from "../../engine";
import { BIG_HOUSE_DECOR_IDS, CHEST_DECOR_IDS, DECORATIONS, HOUSE_DECOR_IDS, decorationFacing, decorationImage, placedFootprint } from "../../data";
import { tileAt } from "../../pathfinding";
import type { DecorationDef, DecorationPlacement, TerrainId } from "../../types";

const SQRT3 = Math.sqrt(3);
/** Must match BattleEngine's private boardPad() (tile * 2.4) — duplicated here rather than
 * exposed because it's one number, not worth widening engine.ts's public surface for. */
const BOARD_PAD_MUL = 2.4;

/** Same formula as BattleEngine.effectAnchor's worldX/worldY — a hex's position independent of
 * camera pan. Duplicated (not imported) because effectAnchor is keyed to the engine's live
 * layout.tile, whereas this renderer needs it before/without going through a render call. */
function hexWorld(col: number, row: number, tile: number): { wx: number; wy: number } {
  return {
    wx: tile * SQRT3 * (col + 0.5 * (row & 1) + 0.5),
    wy: tile * BOARD_PAD_MUL + tile * (1.5 * row + 1),
  };
}

/** Pointy-top hex fan (center + 6 rim vertices + 6 triangles), radius 0.5 so scaling by
 * tile*2 matches Canvas2D's hexPath(ctx, cx, cy, tile*1.0) exactly — same vertex angles
 * (60*i-30 degrees), Y negated to compensate for local Y=+0.5 landing at the screen TOP in
 * this renderer (Canvas2D's Y-down convention has that same vertex angle read as "below
 * center"; see the module comment on the Y-flip). UVs use the same 0..1 mapping a plain
 * PlaneGeometry uses (localX+0.5, localY+0.5, on the SAME already-flipped local Y), so a
 * texture drawn as if filling the full tile*2 square shows through only inside the hex
 * outline — identical to Canvas2D's clip()-then-drawImage. */
function buildHexGeometry(): THREE.BufferGeometry {
  const positions: number[] = [0, 0, 0];
  const uvs: number[] = [0.5, 0.5];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    const x = Math.cos(a) * 0.5;
    const y = -Math.sin(a) * 0.5;
    positions.push(x, y, 0);
    uvs.push(x + 0.5, y + 0.5);
  }
  // Winding order matters: (0, i, i%6+1) comes out clockwise-from-+Z here (culled by the
  // default FrontSide material, since this camera looks down -Z from +Z) — reversed to
  // (0, i%6+1, i) so the hex actually faces the camera.
  const indices: number[] = [];
  for (let i = 1; i <= 6; i++) indices.push(0, (i % 6) + 1, i);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

interface TileMeshEntry {
  mesh: THREE.Mesh;
  id: TerrainId;
  variant: number;
  rot: number;
}

/** Ported verbatim from BattleEngine.drawDecorations' sizing math (see that method's own
 * comments for the reasoning behind each special case) — pure numbers, no canvas calls, so
 * there was nothing renderer-specific to translate. Kept in exact sync with engine.ts by hand;
 * a mismatch here means a prop is sized differently on the two renderers, not a crash, so it
 * won't show up as a type error — check against drawDecorations if a prop looks off. */
function decorSize(id: string, def: DecorationDef, tile: number): { w: number; h: number; dy: number } {
  let minDx = 0;
  let maxDx = 0;
  let minDy = 0;
  let maxDy = 0;
  for (const { dx, dy } of def.footprint) {
    minDx = Math.min(minDx, dx);
    maxDx = Math.max(maxDx, dx);
    minDy = Math.min(minDy, dy);
    maxDy = Math.max(maxDy, dy);
  }
  const one = def.footprint.length === 1;
  const item = CHEST_DECOR_IDS.has(id);
  const tree = id === "dead-tree";
  const log = id === "fallen-log";
  const wall = id === "barricade" || id === "barricade-2";
  const anyHouse = HOUSE_DECOR_IDS.has(id) || BIG_HOUSE_DECOR_IDS.has(id);
  const w = tree
    ? tile * 1.28
    : log
      ? tile * SQRT3 * 2.05
      : wall
        ? tile * 1.42
        : anyHouse
          ? tile * 1.45 * 3
          : item
            ? tile * 0.92
            : one
              ? tile * 1.55
              : tile * SQRT3 * (maxDx - minDx + 1.7);
  const baseH = tree
    ? tile * 2.55
    : log
      ? tile * 0.82
      : wall
        ? tile * 1.18
        : anyHouse
          ? tile * 1.58 * 3
          : item
            ? tile * 0.72
            : one
              ? tile * 1.65
              : tile * (1.5 * (maxDy - minDy) + 2.3);
  const h = baseH * (def.heightScale ?? 1);
  const dy = (tree ? -tile * 0.55 : wall ? -tile * 0.12 : anyHouse ? -tile * 0.28 * 3 : item ? tile * 0.08 : 0) - (h - baseH) * 0.42;
  return { w, h, dy };
}

interface DecorMeshEntry {
  mesh: THREE.Mesh;
  placement: DecorationPlacement;
}

export class ThreeBattleRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private tileGroup = new THREE.Group();
  private tileMeshes = new Map<number, TileMeshEntry>();
  private materialCache = new Map<string, THREE.MeshBasicMaterial>();
  private fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0x1e1b18 });
  private hexGeo = buildHexGeometry();
  private builtCols = -1;
  private builtRows = -1;
  private builtMissionId = "";

  // Ground/behind-layer decorations only (trees, houses, rubble, ...) — see ensureDecorBuilt's
  // comment for why "front"-layer/foreground props stay on the existing Canvas2D-shim units
  // canvas instead of moving here.
  private quadGeo = new THREE.PlaneGeometry(1, 1);
  private decorGroup = new THREE.Group();
  private decorMatCache = new Map<string, THREE.MeshBasicMaterial>();
  private decorEntries: DecorMeshEntry[] = [];
  private builtDecorKey = "";

  constructor(
    canvas: HTMLCanvasElement,
    private engine: BattleEngine,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setClearColor(0x000000, 1);
    this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 2000);
    this.camera.position.z = 100;
    this.scene.add(this.tileGroup);
    this.scene.add(this.decorGroup);
  }

  setSize(cssW: number, cssH: number, dpr: number): void {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(Math.max(1, cssW), Math.max(1, cssH), false);
    this.camera.left = 0;
    this.camera.right = Math.max(1, cssW);
    this.camera.top = Math.max(1, cssH);
    this.camera.bottom = 0;
    this.camera.updateProjectionMatrix();
  }

  private materialFor(id: TerrainId, variant: number): THREE.MeshBasicMaterial {
    const key = `${id}:${variant}`;
    const hit = this.materialCache.get(key);
    if (hit) return hit;
    const variants = this.engine.art.tiles[id];
    const img = variants?.[variant] ?? variants?.[0];
    if (!img) return this.fallbackMaterial;
    const tex = new THREE.Texture(img);
    // Three's default flipY=true is what this needs: with the Y-negation in hexWorld/
    // render() (see module comment), a plane's local Y=-0.5 edge ends up at the screen
    // BOTTOM, and flipY=true samples the image's bottom row there — matching Canvas2D's
    // drawImage orientation. (Verified numerically, not just by eye — see module comment.)
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    this.materialCache.set(key, mat);
    return mat;
  }

  /** (Re)builds every tile mesh at its fixed world position. Called once per map and again
   * whenever board dimensions or the mission itself changes — never on an ordinary camera
   * pan/zoom, which only ever moves the camera (see render()). */
  private ensureBuilt(tile: number): void {
    const engine = this.engine;
    if (this.builtCols === engine.cols && this.builtRows === engine.rows && this.builtMissionId === engine.mission.id) return;
    for (const entry of this.tileMeshes.values()) this.tileGroup.remove(entry.mesh);
    this.tileMeshes.clear();
    this.builtCols = engine.cols;
    this.builtRows = engine.rows;
    this.builtMissionId = engine.mission.id;

    for (let row = 0; row < engine.rows; row++) {
      for (let col = 0; col < engine.cols; col++) {
        const key = row * engine.cols + col;
        const id = tileAt(engine.tiles, engine.cols, col, row);
        const variant = engine.tileVariants[key] ?? 0;
        const rot = engine.tileRots[key] ?? 0;
        const mat = this.materialFor(id, variant);
        const mesh = new THREE.Mesh(this.hexGeo, mat);
        const { wx, wy } = hexWorld(col, row, tile);
        mesh.scale.set(tile * 2, tile * 2, 1);
        // Y negated — see module comment on the frustum/Y-flip.
        mesh.position.set(wx, -wy, 0);
        // A turned hex spins about its own center — see Canvas2D renderGround's identical
        // rot*PI/3 comment. Negated: a mesh's own local rotation isn't touched by the
        // position negation above, so Three's standard (non-inverted-frustum) CCW-positive
        // Z-rotation would appear CCW on screen — the opposite of ctx.rotate()'s CW-positive
        // screen convention — unless flipped here.
        if (rot) mesh.rotation.z = (-rot * Math.PI) / 3;
        this.tileGroup.add(mesh);
        this.tileMeshes.set(key, { mesh, id, variant, rot });
      }
    }
  }

  /** Repositions/retextures only the tiles that actually changed since the last build (a chest
   * opened, a terrain-changing effect fired, ...) — cheap, since most frames change nothing. */
  private syncDirtyTiles(): void {
    const engine = this.engine;
    for (const [key, entry] of this.tileMeshes) {
      const row = Math.floor(key / engine.cols);
      const col = key % engine.cols;
      const id = tileAt(engine.tiles, engine.cols, col, row);
      const variant = engine.tileVariants[key] ?? 0;
      const rot = engine.tileRots[key] ?? 0;
      if (id !== entry.id || variant !== entry.variant) {
        entry.mesh.material = this.materialFor(id, variant);
        entry.id = id;
        entry.variant = variant;
      }
      if (rot !== entry.rot) {
        entry.mesh.rotation.z = (-rot * Math.PI) / 3;
        entry.rot = rot;
      }
    }
  }

  /** Lazily loads a decoration's art file the same way BattleEngine.decorArtReady does — a prop
   * whose art hasn't finished loading yet just doesn't get a mesh (see ensureDecorBuilt) rather
   * than falling back to a placeholder, since ensureDecorBuilt reruns on the next dirty check
   * and a loading placeholder box would be more visually wrong than a prop appearing a frame
   * late. Shares `engine.art.decorations` with the existing Canvas2D renderer's own cache —
   * one image, loaded once, however many renderers end up reading it this milestone. */
  private decorImageReady(fileId: string): HTMLImageElement | null {
    let img = this.engine.art.decorations[fileId];
    if (!img) {
      img = new Image();
      img.src = decorationImage(fileId);
      this.engine.art.decorations[fileId] = img;
    }
    return img.naturalWidth > 0 ? img : null;
  }

  private decorMaterialFor(fileId: string, img: HTMLImageElement): THREE.MeshBasicMaterial {
    const hit = this.decorMatCache.get(fileId);
    if (hit) return hit;
    const tex = new THREE.Texture(img);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    // Decoration art is cut-out PNGs (alpha, not opaque like terrain tiles) — transparent:true
    // is required or the alpha channel is ignored and every prop draws as an opaque rectangle.
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    this.decorMatCache.set(fileId, mat);
    return mat;
  }

  /** (Re)builds every ground/behind-layer decoration mesh at its fixed world position — same
   * "built once, camera moves instead" philosophy as tiles (see ensureBuilt). Skips "front"-
   * layer and foreground=true props on purpose: those are meant to occlude character sprites,
   * which still live on the separate units canvas STACKED ABOVE this one — moving them here
   * would put them permanently behind every unit instead. They keep rendering through
   * BattleEngine.renderUnitsAndOverlays exactly as before, unchanged, until units themselves
   * move onto this renderer and a real depth order between the two exists. */
  private ensureDecorBuilt(tile: number): void {
    const engine = this.engine;
    const key = `${engine.mission.id}:${engine.decorations.length}:${tile}`;
    if (key === this.builtDecorKey) return;
    for (const entry of this.decorEntries) this.decorGroup.remove(entry.mesh);
    this.decorEntries = [];
    this.builtDecorKey = key;

    for (const p of engine.decorations) {
      const def = DECORATIONS[p.id];
      if (!def) continue;
      const decorLayer = def.unitLayer ?? (def.foreground ? "front" : "ground");
      if (decorLayer === "front") continue;

      const facing = decorationFacing(p.id, p.rot ?? 0, (file) => this.decorImageReady(file) !== null);
      const fileId = facing.own ? facing.file : p.id;
      const img = this.decorImageReady(fileId);
      if (!img) continue; // art still loading — picked up on the next ensureDecorBuilt (see decorImageReady)

      let sumWx = 0;
      let sumWy = 0;
      for (const { dx, dy } of placedFootprint(p)) {
        const { wx, wy } = hexWorld(p.x + dx, p.y + dy, tile);
        sumWx += wx;
        sumWy += wy;
      }
      const n = def.footprint.length;
      const { w, h, dy: liftY } = decorSize(p.id, def, tile);
      const wx = sumWx / n;
      const wy = sumWy / n + liftY;

      const mat = this.decorMaterialFor(fileId, img);
      const mesh = new THREE.Mesh(this.quadGeo, mat);
      // Y negated to match the tile/camera convention (see module comment); z=1 keeps decor
      // reliably in front of the flat ground plane at z=0 for any depth-sorting Three does
      // between transparent objects.
      mesh.position.set(wx, -wy, 1);
      if (facing.step === 0) {
        mesh.scale.set(w, h, 1);
      } else if (facing.own) {
        // A prop with its own per-side art mirrors instead of rotating — see
        // decorationFacing's own comment for why (a mirrored drawing still faces outward
        // correctly; a rotated one would tilt the art instead of turning which side faces
        // the viewer).
        mesh.scale.set(facing.mirror ? -w : w, h, 1);
      } else {
        // No dedicated side art: fall back to spinning the bitmap (a placeholder, same as
        // Canvas2D's own fallback) — negated for the same reason tile rotation is (see
        // ensureBuilt's comment).
        mesh.scale.set(w, h, 1);
        mesh.rotation.z = (-facing.step * Math.PI) / 3;
      }
      this.decorGroup.add(mesh);
      this.decorEntries.push({ mesh, placement: p });
    }
  }

  /** Fog-of-war visibility, rechecked every frame without touching geometry — cheap, and most
   * missions have `fog` off entirely (see Mission.fog), in which case this is a no-op loop that
   * only ever sets `visible = true`. */
  private syncDecorVisibility(): void {
    const engine = this.engine;
    if (!engine.fogged) {
      for (const entry of this.decorEntries) entry.mesh.visible = true;
      return;
    }
    for (const entry of this.decorEntries) {
      const p = entry.placement;
      entry.mesh.visible = placedFootprint(p).some((f) => engine.explored(p.x + f.dx, p.y + f.dy));
    }
  }

  /** Call once per frame in place of BattleEngine.renderGround — updateCameraLayout runs the
   * exact same camera/visibility bookkeeping renderGround always did (see that method's own
   * comment), just without drawing through the Canvas2D shim afterward. */
  render(cssW: number, cssH: number): void {
    const tile = this.engine.updateCameraLayout(cssW, cssH);
    this.ensureBuilt(tile);
    this.syncDirtyTiles();
    this.ensureDecorBuilt(tile);
    this.syncDecorVisibility();
    // The camera moves; the tiles never do — see module comment. This is the one line that
    // has to run every frame for panning/zooming to work. Y is `-camY - cssH` to match the
    // mesh placement's own Y-negation (see module comment) — verified numerically to
    // reproduce BattleEngine's cx/cy screen-pixel formula exactly.
    this.camera.position.set(this.engine.camX, -this.engine.camY - cssH, 100);
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.hexGeo.dispose();
    this.quadGeo.dispose();
    this.fallbackMaterial.dispose();
    for (const mat of this.materialCache.values()) {
      mat.map?.dispose();
      mat.dispose();
    }
    for (const mat of this.decorMatCache.values()) {
      mat.map?.dispose();
      mat.dispose();
    }
    this.renderer.dispose();
  }
}
