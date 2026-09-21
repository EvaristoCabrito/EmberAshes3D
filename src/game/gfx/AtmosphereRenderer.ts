/** Global automatic atmospheric rendering system — ambient wash, a slow broad light/shadow
 * field, procedural haze, soft volumetric shafts, drifting dust and a bloom + grading finish,
 * composited as one transparent layer above everything BattleCanvas already draws.
 *
 * Deliberately its own pipeline, independent of EffectsRenderer (the elemental/spell FX
 * overlay in EffectsRenderer.ts): no map author places anything for this, no spell touches
 * it, and it can be switched off entirely (see setEnabled) without any of the rest of the
 * game noticing. It reuses a few of EffectsRenderer's shared building blocks read-only
 * (glutil's FBO helpers, noiseTexture's tileable noise, and a couple of shaders.ts's
 * generic, non-spell-specific passes — the fullscreen triangle, the soft particle mote, the
 * bright-pass/blur pair) exactly the way those files are already shared infrastructure.
 *
 * Every uniform that positions something (u_resolution, u_panOffset, particle centers/radii)
 * is expressed in CSS pixels, never device pixels — the ratios in the vertex math cancel the
 * DPI out on their own, so the same numbers work at any canvas resolution. Only the actual
 * framebuffer/canvas allocations and gl.viewport calls use device pixels, for sharpness. */

import { bindAttrib, createFbo, createFullscreenTri, createProgram, createUnitQuad, deleteFbo, resizeFbo, type Fbo } from "./glutil";
import { buildNoiseTexture } from "./noiseTexture";
import { FRAG_BLUR, FRAG_BRIGHTPASS, FRAG_PARTICLE, VERT_FULLSCREEN, VERT_QUAD } from "./shaders";
import { FRAG_ATMOSPHERE_COMPOSITE, FRAG_ATMOSPHERE_MAIN } from "./atmosphereShaders";
import { DEFAULT_ATMOSPHERE_PROFILE, type AtmosphereProfile } from "./atmosphereParams";

const BLOOM_SCALE = 0.4;

function uniformLocations<T extends readonly string[]>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: T,
): Record<T[number], WebGLUniformLocation | null> {
  const out = {} as Record<T[number], WebGLUniformLocation | null>;
  for (const n of names) out[n as T[number]] = gl.getUniformLocation(program, n);
  return out;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

export class AtmosphereRenderer {
  private gl: WebGL2RenderingContext;
  private triBuf: WebGLBuffer;
  private quadBuf: WebGLBuffer;
  private noiseTex: WebGLTexture;

  private progMain: WebGLProgram;
  private uMain;
  private progParticle: WebGLProgram;
  private uParticle;
  private progBrightpass: WebGLProgram;
  private uBrightpass;
  private progBlur: WebGLProgram;
  private uBlur;
  private progComposite: WebGLProgram;
  private uComposite;

  private mainFbo: Fbo;
  private brightFbo: Fbo;
  private blurFboA: Fbo;
  private blurFboB: Fbo;

  private cssW = 1;
  private cssH = 1;
  private dpr = 1;
  private fullW = 1;
  private fullH = 1;

  private time = 0;
  private profile: AtmosphereProfile = DEFAULT_ATMOSPHERE_PROFILE;
  private motes: Mote[] = [];
  /** Last frame's panOffset, so render() can shift every mote by exactly this frame's camera
   * delta before applying their own drift — see the panOffset comment on render() for why the
   * haze/light-field pass doesn't need this (it samples world space directly) while the motes,
   * which are simple 2D screen-space points, do: without it they'd sit still on screen while
   * the camera pans, reading as drifting backward relative to the map instead of riding along
   * with it. null until the first render() call establishes a baseline (no delta to apply yet). */
  private lastPan: { x: number; y: number } | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;

    this.triBuf = createFullscreenTri(gl);
    this.quadBuf = createUnitQuad(gl);
    this.noiseTex = buildNoiseTexture(gl, 256);

    this.progMain = createProgram(gl, VERT_FULLSCREEN, FRAG_ATMOSPHERE_MAIN);
    this.uMain = uniformLocations(gl, this.progMain, [
      "u_resolution",
      "u_panOffset",
      "u_time",
      "u_noiseTex",
      "u_ambientColor",
      "u_ambientIntensity",
      "u_exposure",
      "u_lightFieldScale",
      "u_lightFieldSpeed",
      "u_lightFieldContrast",
      "u_hazeDensity",
      "u_hazeScale",
      "u_hazeSpeed",
      "u_hazeColor",
      "u_volumetricIntensity",
      "u_volumetricAngle",
      "u_volumetricSpeed",
      "u_volumetricColor",
    ] as const);

    this.progParticle = createProgram(gl, VERT_QUAD, FRAG_PARTICLE);
    this.uParticle = uniformLocations(gl, this.progParticle, [
      "u_resolution",
      "u_center",
      "u_radius",
      "u_rotation",
      "u_worldCenter",
      "u_color",
      "u_alpha",
    ] as const);

    this.progBrightpass = createProgram(gl, VERT_FULLSCREEN, FRAG_BRIGHTPASS);
    this.uBrightpass = uniformLocations(gl, this.progBrightpass, ["u_src", "u_threshold"] as const);

    this.progBlur = createProgram(gl, VERT_FULLSCREEN, FRAG_BLUR);
    this.uBlur = uniformLocations(gl, this.progBlur, ["u_src", "u_texel", "u_direction"] as const);

    this.progComposite = createProgram(gl, VERT_FULLSCREEN, FRAG_ATMOSPHERE_COMPOSITE);
    this.uComposite = uniformLocations(gl, this.progComposite, [
      "u_main",
      "u_bloom",
      "u_bloomStrength",
      "u_contrast",
      "u_saturation",
      "u_vignette",
    ] as const);

    this.mainFbo = createFbo(gl, 2, 2);
    this.brightFbo = createFbo(gl, 2, 2);
    this.blurFboA = createFbo(gl, 2, 2);
    this.blurFboB = createFbo(gl, 2, 2);
  }

  setProfile(profile: AtmosphereProfile): void {
    this.profile = profile;
    this.restockMotes();
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.cssW = Math.max(1, cssW);
    this.cssH = Math.max(1, cssH);
    this.dpr = dpr;
    const fullW = Math.max(1, Math.floor(this.cssW * dpr));
    const fullH = Math.max(1, Math.floor(this.cssH * dpr));
    if (this.canvas.width !== fullW) this.canvas.width = fullW;
    if (this.canvas.height !== fullH) this.canvas.height = fullH;
    this.fullW = fullW;
    this.fullH = fullH;
    const gl = this.gl;
    resizeFbo(gl, this.mainFbo, fullW, fullH);
    const bw = Math.max(1, Math.floor(fullW * BLOOM_SCALE));
    const bh = Math.max(1, Math.floor(fullH * BLOOM_SCALE));
    resizeFbo(gl, this.brightFbo, bw, bh);
    resizeFbo(gl, this.blurFboA, bw, bh);
    resizeFbo(gl, this.blurFboB, bw, bh);
    this.restockMotes();
  }

  /** Keeps the mote pool sized to the current profile and viewport — called on resize and on
   * every profile change rather than every frame, since neither happens often. */
  private restockMotes(): void {
    const want = this.profile.particleCount;
    while (this.motes.length < want) this.motes.push(this.spawnMote(true));
    if (this.motes.length > want) this.motes.length = want;
  }

  private spawnMote(anywhere: boolean): Mote {
    const speed = this.profile.particleSpeed;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * this.cssW,
      y: anywhere ? Math.random() * this.cssH : this.cssH + 8,
      vx: Math.cos(angle) * speed * 0.35,
      vy: -Math.abs(Math.sin(angle)) * speed - speed * 0.25,
      size: this.profile.particleSize * (0.6 + Math.random() * 0.8),
      phase: Math.random() * Math.PI * 2,
    };
  }

  /** Renders the whole pipeline on top of whatever BattleCanvas has already drawn this frame.
   * `panOffset` is screen-minus-world in CSS px for hex (0,0) — see BattleEngine.effectAnchor,
   * whose x/worldX (and y/worldY) difference is exactly this camera pan translation. `enabled`
   * false clears the canvas and skips all work — the runtime AtmosphereFX toggle. */
  render(dt: number, panOffsetX: number, panOffsetY: number, enabled: boolean): void {
    const gl = this.gl;
    if (!enabled) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.fullW, this.fullH);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    this.time += dt;
    const p = this.profile;

    // Dust/ash/mist motes drift in screen space (their own vx/vy, wrapping at the viewport
    // edges) but ride along with camera pans rather than sitting still on screen while the map
    // moves under them — see lastPan's comment for why that shift is applied here rather than
    // sampled in world space like the haze/light-field pass below.
    const panDeltaX = this.lastPan ? panOffsetX - this.lastPan.x : 0;
    const panDeltaY = this.lastPan ? panOffsetY - this.lastPan.y : 0;
    this.lastPan = { x: panOffsetX, y: panOffsetY };
    const margin = 24;
    for (const m of this.motes) {
      m.x += panDeltaX;
      m.y += panDeltaY;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.phase += dt;
      m.x += Math.sin(m.phase * 0.6) * 6 * dt;
      if (m.x < -margin) m.x = this.cssW + margin;
      if (m.x > this.cssW + margin) m.x = -margin;
      if (m.y < -margin) {
        m.y = this.cssH + margin;
        m.x = Math.random() * this.cssW;
      }
      if (m.y > this.cssH + margin) {
        m.y = -margin;
        m.x = Math.random() * this.cssW;
      }
    }

    // 1. Main pass: ambient + light field + haze + volumetric shafts, world-space.
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.mainFbo.fbo);
    gl.viewport(0, 0, this.mainFbo.w, this.mainFbo.h);
    gl.disable(gl.BLEND);
    gl.useProgram(this.progMain);
    bindAttrib(gl, this.triBuf, 0, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTex);
    gl.uniform1i(this.uMain.u_noiseTex, 0);
    gl.uniform2f(this.uMain.u_resolution, this.cssW, this.cssH);
    gl.uniform2f(this.uMain.u_panOffset, panOffsetX, panOffsetY);
    gl.uniform1f(this.uMain.u_time, this.time);
    gl.uniform3f(this.uMain.u_ambientColor, ...p.ambientColor);
    gl.uniform1f(this.uMain.u_ambientIntensity, p.ambientIntensity);
    gl.uniform1f(this.uMain.u_exposure, p.exposure);
    gl.uniform1f(this.uMain.u_lightFieldScale, p.lightFieldScale);
    gl.uniform1f(this.uMain.u_lightFieldSpeed, p.lightFieldSpeed);
    gl.uniform1f(this.uMain.u_lightFieldContrast, p.lightFieldContrast);
    gl.uniform1f(this.uMain.u_hazeDensity, p.hazeDensity);
    gl.uniform1f(this.uMain.u_hazeScale, p.hazeScale);
    gl.uniform1f(this.uMain.u_hazeSpeed, p.hazeSpeed);
    gl.uniform3f(this.uMain.u_hazeColor, ...p.hazeColor);
    gl.uniform1f(this.uMain.u_volumetricIntensity, p.volumetricIntensity);
    gl.uniform1f(this.uMain.u_volumetricAngle, p.volumetricAngle);
    gl.uniform1f(this.uMain.u_volumetricSpeed, p.volumetricSpeed);
    gl.uniform3f(this.uMain.u_volumetricColor, ...p.volumetricColor);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Motes ride on top of the same FBO, additive, so their bright cores also feed the bloom
    // pass below.
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
    gl.useProgram(this.progParticle);
    bindAttrib(gl, this.quadBuf, 0, 2);
    gl.uniform2f(this.uParticle.u_resolution, this.cssW, this.cssH);
    gl.uniform3f(this.uParticle.u_color, ...p.particleColor);
    for (const m of this.motes) {
      gl.uniform2f(this.uParticle.u_center, m.x, m.y);
      gl.uniform2f(this.uParticle.u_radius, m.size, m.size);
      gl.uniform1f(this.uParticle.u_rotation, 0);
      gl.uniform2f(this.uParticle.u_worldCenter, m.x, m.y);
      gl.uniform1f(this.uParticle.u_alpha, 0.5 + 0.5 * Math.sin(m.phase));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.disable(gl.BLEND);

    // 2. Bright-pass + separable blur, at reduced resolution — same technique as the
    //    elemental FX bloom chain, just a separate set of FBOs.
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.brightFbo.fbo);
    gl.viewport(0, 0, this.brightFbo.w, this.brightFbo.h);
    gl.useProgram(this.progBrightpass);
    bindAttrib(gl, this.triBuf, 0, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.mainFbo.tex);
    gl.uniform1i(this.uBrightpass.u_src, 0);
    gl.uniform1f(this.uBrightpass.u_threshold, p.bloomThreshold);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.useProgram(this.progBlur);
    bindAttrib(gl, this.triBuf, 0, 2);
    gl.uniform1i(this.uBlur.u_src, 0);
    const passes: [Fbo, Fbo][] = [
      [this.brightFbo, this.blurFboA],
      [this.blurFboA, this.blurFboB],
      [this.blurFboB, this.blurFboA],
    ];
    const dirs: [number, number][] = [
      [1, 0],
      [0, 1],
      [1, 0],
    ];
    for (let i = 0; i < passes.length; i++) {
      const [src, dst] = passes[i]!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
      gl.viewport(0, 0, dst.w, dst.h);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform2f(this.uBlur.u_texel, 1 / src.w, 1 / src.h);
      gl.uniform2f(this.uBlur.u_direction, dirs[i]![0], dirs[i]![1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const bloomResult = this.blurFboA;

    // 3. Composite: bloom added back on top of the main layer, then contrast/saturation/
    //    vignette — straight onto the visible canvas.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.fullW, this.fullH);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.progComposite);
    bindAttrib(gl, this.triBuf, 0, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.mainFbo.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bloomResult.tex);
    gl.uniform1i(this.uComposite.u_main, 0);
    gl.uniform1i(this.uComposite.u_bloom, 1);
    gl.uniform1f(this.uComposite.u_bloomStrength, p.bloomStrength);
    gl.uniform1f(this.uComposite.u_contrast, p.contrast);
    gl.uniform1f(this.uComposite.u_saturation, p.saturation);
    gl.uniform1f(this.uComposite.u_vignette, p.vignette);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    const gl = this.gl;
    deleteFbo(gl, this.mainFbo);
    deleteFbo(gl, this.brightFbo);
    deleteFbo(gl, this.blurFboA);
    deleteFbo(gl, this.blurFboB);
    gl.deleteTexture(this.noiseTex);
    gl.deleteProgram(this.progMain);
    gl.deleteProgram(this.progParticle);
    gl.deleteProgram(this.progBrightpass);
    gl.deleteProgram(this.progBlur);
    gl.deleteProgram(this.progComposite);
  }
}
