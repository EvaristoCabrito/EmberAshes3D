/** MILESTONE 3 — real world-space fog + particles, built as actual scene geometry (not a
 * screen-space Canvas2D/CSS overlay like the old, rejected AtmosphereFX — see
 * gfx/AtmosphereRenderer.ts's own comment and THREEJS_MILESTONE2_HANDOFF.md's "Old atmosphere
 * system" section).
 *
 * WHY NOT scene.fog / THREE.Fog / THREE.FogExp2: both compute density purely from distance to
 * camera. This scene's camera is a fixed-Z (100) orthographic camera aimed straight down -Z
 * forever (see ThreeBattleRenderer.ts's module comment) — no perspective, no rotation. That makes
 * "distance to camera" a pure function of a fragment's world Z, nothing else. Every VISIBLE mesh
 * in the confirmed, shipped Milestone 1/2 scene (tiles z=0, overlay z=0.5, decor z=1, units
 * z=2..3) sits inside a 3-unit-tall band out of that 100-unit camera distance — built-in fog at
 * any density that visibly did anything to that band would be indistinguishable from a single
 * flat tint applied to literally everything at once, i.e. the exact "flat overlay" failure mode
 * the user rejected, just relocated from a canvas filter to a camera-distance formula. So real
 * height-based depth has to be AUTHORED directly into new geometry that spans real Z — the same
 * tens-of-world-px vocabulary Milestone 2 already proved out for its invisible shadow casters
 * (UNIT_SHADOW_HEIGHT_SCALE/DECOR_SHADOW_HEIGHT_SCALE in ThreeBattleRenderer.ts) — not leaned on
 * scene.fog. `scene.fog` is deliberately never set anywhere in this renderer.
 *
 * A consequence of the above worth stating plainly: on this camera, elevation buys no
 * foreshortening/occlusion cue the way it would on a tilted camera — a quad at Z=40 is
 * pixel-identical in size/position to one at Z=4, just composited later (closer to the camera).
 * So both systems below are placed at Z > 3, strictly above every existing visible mesh
 * (confirmed-working Milestone 1/2 tile/decor/unit sprites are NEVER touched by this file) — mist
 * and particles always draw in front of the board, never interleaved with individual units/decor,
 * which is an honest, stable trade-off (a single mist plane can't sort "behind this unit, in
 * front of that one" against many individual sprites without flicker) rather than an attempt at
 * true per-pixel height occlusion this camera can't give anyway. `renderOrder` backs this up
 * explicitly (10-12 mist layers, 13 dust, 14 embers, vs. every existing mesh's default 0) so the
 * stacking is deterministic even where Z-distance alone would be ambiguous.
 *
 * Neither system casts or receives shadows (both default false, left untouched) — a
 * PCF-filtered shadow lookup against a huge, additively-blended, constantly-drifting transparent
 * volume would be visually meaningless and a real, avoidable cost on top of the existing
 * 2048x2048 shadow map.
 *
 * Fog-of-war: tile meshes already render unconditionally with no per-tile visibility check today
 * (only decorations get that treatment — see ThreeBattleRenderer.syncDecorVisibility), so a
 * board-wide mist/particle spread is consistent with existing behavior, not a regression. No
 * explored-cell masking here — real, non-trivial extra work out of proportion to this milestone;
 * flagged as a known follow-up if a fogged mission ever gets a non-zero tier. */

import * as THREE from "three";
import type { BattleEngine } from "../../engine";

/** Mist tuning for one frame — built fresh from Mission.mistIntensity in ThreeAtmosphere.sync()
 * (see its own comment) rather than a hardcoded per-mission-id table, so the Map Editor's
 * "Névoa" slider is the one real source of this, not a file only a developer can edit. */
interface AtmosphereTier {
  mistIntensity: number;
  mistHeight: number;
  mistColor: number;
  dustCount: number;
  emberCount: number;
  emberRiseHeight: number;
}

/** wispIntensity=1 (the editor slider's max) maps to this many ember instances — deliberately
 * high enough to be genuinely overwhelming at max, on purpose (see Mission.wispIntensity). */
const MAX_EMBER_COUNT = 2000;

const SQRT3 = Math.sqrt(3);
/** Must match BattleEngine's private boardPad()/boardSize() (tile * 2.4) — duplicated, not
 * imported, same precedent ThreeBattleRenderer.ts's own hexWorld already set for this exact
 * formula. Kept in sync by hand; check against engine.ts's boardSize if board-edge coverage ever
 * looks off. */
const BOARD_PAD_MUL = 2.4;

function boardSize(cols: number, rows: number, tile: number): { w: number; h: number } {
  return {
    w: tile * SQRT3 * (cols + 0.5),
    h: tile * (1.5 * (rows - 1) + 2) + tile * BOARD_PAD_MUL,
  };
}

// ---------------------------------------------------------------------------------------------
// Ground mist, take 3: back to the original layered-plane structure, but the noise itself is now
// a pre-baked TEXTURE sampled with bilinear filtering (ported from the old, rejected
// gfx/noiseTexture.ts's exact tileable value-noise algorithm — that file's actual math was never
// the problem, only its old screen-space-overlay delivery was, per direct instruction to reuse
// it), not hand-rolled per-pixel hash noise. Hash noise has an inherent cellular/grid structure
// that read as a "blobby camo pattern" no matter how its contrast was tuned; texture-sampled fbm
// is naturally smooth because the GPU's bilinear filtering interpolates between texels for free.
// This mirrors gfx/atmosphereShaders.ts's FRAG_GROUND_HAZE technique exactly (same fbm weights,
// same "just multiply by density, no extra contrast curve" approach), adapted from a screen-space
// pass into real world-anchored plane geometry.

function hash2(x: number, y: number, seed: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return h - Math.floor(h);
}

function valueNoiseTileable(u: number, v: number, freq: number, seed: number): number {
  const xf = u * freq;
  const yf = v * freq;
  const x0 = Math.floor(xf);
  const y0 = Math.floor(yf);
  const tx = xf - x0;
  const ty = yf - y0;
  const wrap = (n: number) => ((n % freq) + freq) % freq;
  const h00 = hash2(wrap(x0), wrap(y0), seed);
  const h10 = hash2(wrap(x0 + 1), wrap(y0), seed);
  const h01 = hash2(wrap(x0), wrap(y0 + 1), seed);
  const h11 = hash2(wrap(x0 + 1), wrap(y0 + 1), seed);
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = h00 + (h10 - h00) * sx;
  const b = h01 + (h11 - h01) * sx;
  return a + (b - a) * sy;
}

/** Builds the exact same tileable-noise RGB data gfx/noiseTexture.ts's buildNoiseTexture bakes
 * for the old (rejected) system, as a THREE.DataTexture instead of a raw WebGL2 texture — the
 * noise algorithm is reused verbatim, only the texture object type changes. */
function buildMistNoiseTexture(size = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const r = valueNoiseTileable(u, v, 4, 1.7);
      const g = valueNoiseTileable(u, v, 9, 5.3);
      const b = valueNoiseTileable(u, v, 17, 11.1);
      const i = (y * size + x) * 4;
      data[i] = Math.round(r * 255);
      data[i + 1] = Math.round(g * 255);
      data[i + 2] = Math.round(b * 255);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

const MIST_VERTEX = /* glsl */ `
  varying vec2 vWorldXY;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldXY = worldPos.xy;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const MIST_FRAGMENT = /* glsl */ `
  uniform sampler2D uNoiseTex;
  uniform float uTime;
  uniform float uScale;
  uniform vec2 uDrift;
  uniform vec3 uColor;
  uniform vec3 uSunColor;
  uniform float uAlpha;
  varying vec2 vWorldXY;

  // Same three-octave weighted sum as atmosphereShaders.ts's FRAG_GROUND_HAZE fbm() — three
  // texture fetches at different scales/offsets, texture filtering does the smoothing for free.
  float fbm(vec2 uv) {
    return texture2D(uNoiseTex, uv).r * 0.55
         + texture2D(uNoiseTex, uv * 2.3 + 3.1).g * 0.3
         + texture2D(uNoiseTex, uv * 4.7 + 9.4).b * 0.15;
  }

  void main() {
    vec2 uv = vWorldXY * uScale + uTime * uDrift;
    float n = clamp(fbm(uv), 0.0, 1.0);
    // No contrast-curve reshaping here on purpose (unlike every earlier hash-noise attempt) —
    // real fbm from filtered texture samples already looks like soft haze, not a mathematical
    // pattern; a smoothstep/pow curve was only ever needed to fight hash noise's harder edges.
    vec3 color = mix(uColor, uSunColor, 0.35);
    gl_FragColor = vec4(color, n * uAlpha);
  }
`;

class GroundMist {
  readonly group = new THREE.Group();
  private geo = new THREE.PlaneGeometry(1, 1);
  private noiseTex = buildMistNoiseTexture();
  private materials: THREE.ShaderMaterial[] = [];
  private meshes: THREE.Mesh[] = [];
  private builtKey = "";

  // Original layered structure: denser near the ground, each layer drifting independently so
  // they never read as one plane repeated.
  private static readonly LAYER_FALLOFF = [1.0, 0.6, 0.32];
  private static readonly LAYER_Z_FRAC = [0.08, 0.4, 0.85];
  // These magnitudes are the CONFIRMED-visible drift speed found earlier tonight (~18x the
  // original 0.008-0.014 values, which were technically animating but far too slow to perceive
  // as movement over a normal glance — verified by comparing two frames several seconds apart).
  // Cut roughly in half from the "confirmed visible" values above — smooth texture-sampled noise
  // reads motion much more legibly than the old hash noise did, so the same raw speed that was
  // barely perceptible before now reads as "too speedy" (direct feedback). The editor's "Vel. da
  // névoa" slider still scales from this new baseline if a specific map wants it faster/slower.
  private static readonly LAYER_DRIFT: [number, number][] = [
    [0.07, 0.11],
    [-0.095, 0.05],
    [0.045, -0.12],
  ];
  /** Strictly above the unit sprite band (max ~3) — see module comment on Z-ordering. Fixed
   * per-layer values, NOT derived from any per-instance random seed — the puff system's bug was
   * exactly that mistake (an unbounded per-instance value used as a Z coordinate, pushing most
   * instances behind the camera). These three are hand-picked constants, always in view. */
  private static readonly BASE_Z = 5;

  constructor() {
    for (let i = 0; i < 3; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: MIST_VERTEX,
        fragmentShader: MIST_FRAGMENT,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uNoiseTex: { value: this.noiseTex },
          uTime: { value: 0 },
          uScale: { value: 0.003 },
          uDrift: { value: new THREE.Vector2(...GroundMist.LAYER_DRIFT[i]!) },
          uColor: { value: new THREE.Color(0xaab4ad) },
          uSunColor: { value: new THREE.Color(0xffffff) },
          uAlpha: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(this.geo, material);
      mesh.renderOrder = 10 + i;
      this.materials.push(material);
      this.meshes.push(mesh);
      this.group.add(mesh);
    }
  }

  rebuild(cols: number, rows: number, tile: number, missionId: string, tier: AtmosphereTier): void {
    const key = `${missionId}:${cols}:${rows}:${tile}`;
    if (key !== this.builtKey) {
      this.builtKey = key;
      const { w, h } = boardSize(cols, rows, tile);
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < this.meshes.length; i++) {
        const mesh = this.meshes[i]!;
        // 1.15x overscan so panning to the board edge doesn't reveal a hard mist boundary.
        mesh.scale.set(w * 1.15, h * 1.15, 1);
        mesh.position.set(cx, -cy, GroundMist.BASE_Z + tier.mistHeight * GroundMist.LAYER_Z_FRAC[i]!);
      }
    }
    for (let i = 0; i < this.materials.length; i++) {
      const material = this.materials[i]!;
      (material.uniforms.uColor!.value as THREE.Color).setHex(tier.mistColor);
      material.uniforms.uAlpha!.value = tier.mistIntensity * GroundMist.LAYER_FALLOFF[i]!;
    }
    this.group.visible = tier.mistIntensity > 0;
  }

  sync(dt: number, sunLight: THREE.DirectionalLight, speed: number): void {
    for (const material of this.materials) {
      material.uniforms.uTime!.value += dt * speed;
      (material.uniforms.uSunColor!.value as THREE.Color).copy(sunLight.color).multiplyScalar(Math.min(1.5, sunLight.intensity * 0.6));
    }
  }

  dispose(): void {
    this.geo.dispose();
    this.noiseTex.dispose();
    for (const material of this.materials) material.dispose();
  }
}

// ---------------------------------------------------------------------------------------------
// "Mist 3" — the earlier large-soft-drifting-puff implementation, kept as its own selectable
// option (Mission.mistType === "mist3") rather than deleted, per direct instruction. Z is a
// fixed per-instance range (6 to 12, via fract(aSeed)) — NOT the raw unbounded aSeed value,
// which was this system's original real bug: aSeed ranges up to 1000, and using it directly as
// a Z coordinate pushed most puffs to Z~6000, far behind the camera (which sits at Z=100 looking
// toward -Z), so they were clipped out of view regardless of intensity. Puff count also scales
// with board area (not a fixed small number) — a fixed low count left most of a large board's
// camera view empty of puffs even when some did render.

const MIST_PUFF_VERTEX = /* glsl */ `
  attribute vec2 aBase;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  varying vec2 vUv;
  varying float vOpacity;
  void main() {
    vUv = uv;
    float t = uTime + aSeed * 53.0;
    vec2 wander = vec2(sin(t * 0.05 + aSeed * 4.0), cos(t * 0.037 + aSeed * 6.0)) * (aSize * 0.9);
    vec3 worldPos = vec3(aBase + wander, 6.0 + fract(aSeed) * 6.0);
    vec3 corner = worldPos + vec3(position.xy * aSize, 0.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(corner, 1.0);
    vOpacity = 0.7 + 0.3 * sin(t * 0.08 + aSeed * 9.0);
  }
`;

const MIST_PUFF_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunColor;
  uniform float uAlpha;
  varying vec2 vUv;
  varying float vOpacity;
  void main() {
    float d = distance(vUv, vec2(0.5)) * 2.0;
    float mask = pow(clamp(1.0 - d, 0.0, 1.0), 1.8);
    vec3 color = mix(uColor, uSunColor, 0.35);
    gl_FragColor = vec4(color, mask * uAlpha * vOpacity);
  }
`;

class GroundMistPuffs {
  readonly group = new THREE.Group();
  private geo: THREE.PlaneGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private mesh: THREE.InstancedMesh | null = null;
  private builtKey = "";

  private static puffCount(boardW: number, boardH: number, tile: number): number {
    const perPuffArea = tile * tile * 26;
    return Math.min(160, Math.max(28, Math.round((boardW * boardH) / perPuffArea)));
  }

  rebuild(cols: number, rows: number, tile: number, missionId: string, tier: AtmosphereTier): void {
    const key = `${missionId}:${cols}:${rows}:${tile}`;
    const shouldExist = tier.mistIntensity > 0;
    if (!shouldExist) {
      if (this.mesh) this.teardown();
      this.builtKey = "";
      return;
    }
    if (key === this.builtKey && this.mesh) {
      (this.material!.uniforms.uColor!.value as THREE.Color).setHex(tier.mistColor);
      this.material!.uniforms.uAlpha!.value = tier.mistIntensity * 0.55;
      return;
    }
    this.builtKey = key;
    this.teardown();

    const { w: boardW, h: boardH } = boardSize(cols, rows, tile);
    const count = GroundMistPuffs.puffCount(boardW, boardH, tile);
    const geo = new THREE.PlaneGeometry(1, 1);
    const aBase = new Float32Array(count * 2);
    const aSeed = new Float32Array(count);
    const aSize = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      aBase[i * 2] = Math.random() * boardW;
      aBase[i * 2 + 1] = -Math.random() * boardH;
      aSeed[i] = Math.random() * 1000;
      aSize[i] = tile * (3.5 + Math.random() * 3.5);
    }
    geo.setAttribute("aBase", new THREE.InstancedBufferAttribute(aBase, 2));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 1));
    geo.setAttribute("aSize", new THREE.InstancedBufferAttribute(aSize, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: MIST_PUFF_VERTEX,
      fragmentShader: MIST_PUFF_FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(tier.mistColor) },
        uSunColor: { value: new THREE.Color(0xffffff) },
        uAlpha: { value: tier.mistIntensity * 0.55 },
      },
    });

    const mesh = new THREE.InstancedMesh(geo, material, count);
    mesh.frustumCulled = false;
    mesh.renderOrder = 10;
    const identity = new THREE.Matrix4();
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity);
    mesh.instanceMatrix.needsUpdate = true;

    this.geo = geo;
    this.material = material;
    this.mesh = mesh;
    this.group.add(mesh);
  }

  sync(dt: number, sunLight: THREE.DirectionalLight, speed: number): void {
    if (!this.material) return;
    this.material.uniforms.uTime!.value += dt * speed;
    (this.material.uniforms.uSunColor!.value as THREE.Color).copy(sunLight.color).multiplyScalar(Math.min(1.5, sunLight.intensity * 0.6));
  }

  private teardown(): void {
    if (this.mesh) this.group.remove(this.mesh);
    this.geo?.dispose();
    this.material?.dispose();
    this.geo = null;
    this.material = null;
    this.mesh = null;
  }

  dispose(): void {
    this.teardown();
  }
}

// ---------------------------------------------------------------------------------------------
// Drift particles: GPU-driven InstancedMesh quads. Position is computed per-vertex on the GPU
// from a per-instance world-anchor + seed and the single uTime uniform — the only per-frame CPU
// work is updating that one float (plus a cheap CPU Color.lerp for light-tinting, see sync()).
// This is deliberately NOT the CPU pooled-particle pattern gfx/particles.ts uses for spell FX
// (mesh.setMatrixAt() every frame for thousands of instances would be a CPU bottleneck, not a
// GPU one) — instanced attributes + a GPU drift function is the actual "spend the GPU, not the
// CPU" approach the user asked for.

const PARTICLE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float mask = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor, mask * vAlpha * uOpacity);
  }
`;

const DUST_VERTEX = /* glsl */ `
  attribute vec2 aBase;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vUv = uv;
    float t = uTime + aSeed * 37.0;
    vec2 wander = vec2(sin(t * 0.35 + aSeed * 6.0), cos(t * 0.27 + aSeed * 9.0)) * 9.0;
    float z = 6.0 + sin(t * 0.5 + aSeed * 3.0) * 3.0;
    // This camera is orthographic with zero perspective (see module header) — height alone
    // produces NO visible size/position cue on its own, a mote at z=3 looks pixel-identical to
    // one at z=9 otherwise. zNorm fakes the depth cue instead: dimmer/smaller near the ground,
    // brighter/bigger near the top of its float range, so height actually reads as height.
    float zNorm = clamp((z - 3.0) / 6.0, 0.0, 1.0);
    vec3 worldPos = vec3(aBase + wander, z);
    vec3 corner = worldPos + vec3(position.xy * aSize * mix(0.55, 1.0, zNorm), 0.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(corner, 1.0);
    vAlpha = mix(0.3, 1.0, zNorm) * (0.5 + 0.5 * sin(t * 0.6 + aSeed * 5.0));
  }
`;

const EMBER_VERTEX = /* glsl */ `
  attribute vec2 aBase;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uRiseHeight;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vUv = uv;
    // Baseline pace for uSpeed/wispSpeed = 1.0 (see ParticleField.sync/Mission.wispSpeed) — a
    // ~64s cycle (the previous value) looked frozen over a normal glance, and the original
    // 14.0 read as darting; this is the middle ground: clearly, gently drifting. The editor's
    // "Velocidade" slider scales this up or down from here — no shader edit needed to retune.
    const float RISE_SPEED = 6.0;
    float cycle = uRiseHeight / RISE_SPEED;
    float t = mod(uTime * RISE_SPEED + aSeed * cycle, cycle);
    float rise01 = t / cycle;
    float z = 4.0 + t;
    vec2 sway = vec2(sin(uTime * 0.4 + aSeed * 10.0), cos(uTime * 0.32 + aSeed * 7.0)) * 6.0;
    vec3 worldPos = vec3(aBase + sway, z);
    // Same "fake the height cue" reasoning as dust's zNorm — an ember starts small/dim at the
    // ground and swells as it climbs, echoing a real spark catching more open air, instead of
    // popping into existence as a full-size dot with no sense of where it started.
    float sizeMul = mix(0.5, 1.2, smoothstep(0.0, 0.55, rise01));
    vec3 corner = worldPos + vec3(position.xy * aSize * sizeMul, 0.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(corner, 1.0);
    // smoothstep both ends so the loop-back to the ground is invisible, not a pop.
    vAlpha = smoothstep(0.0, 0.08, rise01) * smoothstep(1.0, 0.85, rise01);
  }
`;

type ParticleKind = "dust" | "ember";

class ParticleField {
  readonly group = new THREE.Group();
  private geo: THREE.PlaneGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private mesh: THREE.InstancedMesh | null = null;
  private builtKey = "";
  private readonly baseColor: THREE.Color;

  constructor(private readonly kind: ParticleKind) {
    this.baseColor = kind === "ember" ? new THREE.Color(0xffa552) : new THREE.Color(0xd6d2bf);
  }

  private rebuild(boardW: number, boardH: number, tile: number, count: number, riseHeight: number): void {
    this.teardown();
    if (count <= 0) return;

    const geo = new THREE.PlaneGeometry(1, 1);
    const aBase = new Float32Array(count * 2);
    const aSeed = new Float32Array(count);
    const aSize = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      aBase[i * 2] = Math.random() * boardW;
      aBase[i * 2 + 1] = -Math.random() * boardH; // pre-negated — see module Y-convention note
      aSeed[i] = Math.random() * 1000;
      // Small — the earlier 0.16-0.38x tile sizing at thousands of instances produced a field of
      // uniformly bright dots that read as a 2D confetti overlay, not ambient atmosphere (see
      // ThreeAtmosphere.ts's module comment history / user feedback). Kept modest on purpose.
      aSize[i] = tile * (this.kind === "ember" ? 0.07 + Math.random() * 0.06 : 0.05 + Math.random() * 0.06);
    }
    geo.setAttribute("aBase", new THREE.InstancedBufferAttribute(aBase, 2));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 1));
    geo.setAttribute("aSize", new THREE.InstancedBufferAttribute(aSize, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: this.kind === "ember" ? EMBER_VERTEX : DUST_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: this.kind === "ember" ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: this.baseColor.clone() },
        uOpacity: { value: this.kind === "ember" ? 0.9 : 0.5 },
        ...(this.kind === "ember" ? { uRiseHeight: { value: riseHeight } } : {}),
      },
    });

    const mesh = new THREE.InstancedMesh(geo, material, count);
    // The vertex shaders above compute world position from aBase/uTime directly, never from
    // mesh.matrixWorld — so the auto bounding-sphere Three would cull against (a tiny box around
    // the local PlaneGeometry origin) is meaningless here and would cull the whole field.
    mesh.frustumCulled = false;
    mesh.renderOrder = this.kind === "ember" ? 14 : 13;
    // instanceMatrix is never read by our custom vertex shaders (no <project_vertex> chunk, no
    // reference to it) — filled with identity anyway as cheap, one-time insurance rather than
    // leaving it zero-initialized.
    const identity = new THREE.Matrix4();
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity);
    mesh.instanceMatrix.needsUpdate = true;

    this.geo = geo;
    this.material = material;
    this.mesh = mesh;
    this.group.add(mesh);
  }

  sync(
    boardW: number,
    boardH: number,
    tile: number,
    rebuildKey: string,
    count: number,
    riseHeight: number,
    dt: number,
    lightColor: THREE.Color,
    speed: number,
    fixedColor: THREE.Color | null,
  ): void {
    const fullKey = `${rebuildKey}:${count}:${riseHeight.toFixed(2)}`;
    if (fullKey !== this.builtKey) {
      this.builtKey = fullKey;
      this.rebuild(boardW, boardH, tile, count, riseHeight);
    }
    if (!this.material) return;
    // Every time-driven motion in the vertex shaders (rise cycle, sway) derives from uTime alone
    // — scaling how fast uTime itself accumulates scales all of it together, so a "speed" dial
    // needs no shader change, just a different dt multiplier here.
    this.material.uniforms.uTime!.value += dt * speed;
    const uColor = this.material.uniforms.uColor!.value as THREE.Color;
    // Fixed color, no automatic light-mixing, on direct instruction ("pick a fucking color or
    // allow me to pick, not mixing") — only falls back to the old light-lerp tint when no fixed
    // color is given (dust, not currently exposed to the editor).
    if (fixedColor) uColor.copy(fixedColor);
    else uColor.copy(this.baseColor).lerp(lightColor, 0.3);
  }

  private teardown(): void {
    if (this.mesh) this.group.remove(this.mesh);
    this.geo?.dispose();
    this.material?.dispose();
    this.geo = null;
    this.material = null;
    this.mesh = null;
  }

  dispose(): void {
    this.teardown();
  }
}

// ---------------------------------------------------------------------------------------------

export class ThreeAtmosphere {
  readonly group = new THREE.Group();
  private readonly mist2 = new GroundMist();
  private readonly mist3 = new GroundMistPuffs();
  private readonly dust = new ParticleField("dust");
  private readonly embers = new ParticleField("ember");
  private readonly scratchSunColor = new THREE.Color();
  private readonly scratchHemiColor = new THREE.Color();
  private readonly scratchWispColor = new THREE.Color();

  constructor() {
    this.group.add(this.mist2.group, this.mist3.group, this.dust.group, this.embers.group);
  }

  sync(engine: BattleEngine, tile: number, dt: number, sunLight: THREE.DirectionalLight, hemiLight: THREE.HemisphereLight): void {
    // Mission-authored, not a hardcoded per-id table (see Mission.mistIntensity/wispIntensity/
    // wispSpeed in types.ts) — the Map Editor's "Névoa"/"Wisps"/"Velocidade" sliders are the one
    // real source of this. Full range, deliberately: sliders go from "off" to genuinely extreme
    // on purpose (per direct instruction — max means max), not pre-limited "for their own good".
    // Dust stays off (count 0) for now — only wisps (embers) were asked for; dust's plumbing is
    // left in place, unused, for whenever it is.
    const wisp = engine.mission.wispIntensity ?? 0.3;
    const wispSpeed = engine.mission.wispSpeed ?? 1;
    const mistSpeed = engine.mission.mistSpeed ?? 1;
    // "vignette" mistType means neither world-space mist implementation should render at all —
    // that look comes entirely from BattleCanvas.tsx's screen-space CSS vignette instead.
    const mistType = engine.mission.mistType ?? "mist2";
    const worldMistIntensity = mistType === "vignette" ? 0 : (engine.mission.mistIntensity ?? 0.5);
    const tier: AtmosphereTier = {
      // Plain default, not a forced floor — a floor would override an explicit 0 the author
      // deliberately set to turn mist off on a specific map ("if I don't want it somewhere I'll
      // remove it myself"), which defeats the point of a real per-map control. The editor's
      // blankDraft/missionToDraft (GameApp.tsx) now default the slider itself to 0.5 for any
      // mission that's never explicitly set this, so "on everywhere by default" comes from
      // the actual authored/displayed value, not a hidden runtime override fighting it.
      mistIntensity: worldMistIntensity,
      mistHeight: 40,
      mistColor: 0xaab4ad,
      dustCount: 0,
      emberCount: Math.round(wisp * MAX_EMBER_COUNT),
      emberRiseHeight: 90,
    };
    const key = `${engine.mission.id}:${engine.cols}:${engine.rows}:${tile}`;
    const { w: boardW, h: boardH } = boardSize(engine.cols, engine.rows, tile);

    // Only the selected implementation gets a nonzero tier — the other's own rebuild() sees
    // mistIntensity <= 0 via a zeroed-out copy and tears itself down/stays hidden, the same as
    // if the author had just set the slider to 0 on that one.
    const mist2Tier: AtmosphereTier = { ...tier, mistIntensity: mistType === "mist2" ? worldMistIntensity : 0 };
    const mist3Tier: AtmosphereTier = { ...tier, mistIntensity: mistType === "mist3" ? worldMistIntensity : 0 };
    this.mist2.rebuild(engine.cols, engine.rows, tile, engine.mission.id, mist2Tier);
    this.mist2.sync(dt, sunLight, mistSpeed);
    this.mist3.rebuild(engine.cols, engine.rows, tile, engine.mission.id, mist3Tier);
    this.mist3.sync(dt, sunLight, mistSpeed);

    this.scratchSunColor.copy(sunLight.color).multiplyScalar(Math.min(1.5, sunLight.intensity * 0.6));
    this.scratchHemiColor.copy(hemiLight.color).multiplyScalar(Math.min(1.5, hemiLight.intensity * 1.2));

    this.scratchWispColor.setHex(engine.mission.wispColor ?? 0xffa552);

    this.dust.sync(boardW, boardH, tile, key, tier.dustCount, tier.emberRiseHeight, dt, this.scratchHemiColor, 1, null);
    this.embers.sync(boardW, boardH, tile, key, tier.emberCount, tier.emberRiseHeight, dt, this.scratchSunColor, wispSpeed, this.scratchWispColor);
  }

  dispose(): void {
    this.mist2.dispose();
    this.mist3.dispose();
    this.dust.dispose();
    this.embers.dispose();
  }
}
