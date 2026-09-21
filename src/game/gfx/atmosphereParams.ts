/** Tunable knobs for the global atmospheric rendering system — ambient light, a slow-drifting
 * light field, procedural haze, soft volumetric shafts, drifting dust, bloom and final grading.
 * Every map gets DEFAULT_ATMOSPHERE_PROFILE unless it sets its own `atmosphere` override on the
 * Mission (see types.ts) — BattleEngine merges the two once at construction (see
 * BattleEngine.atmosphereProfile). This is deliberately its own pipeline: it never reads or
 * writes anything in params.ts/shaders.ts's elemental FX state, so it can be authored, toggled
 * or torn out without touching a single spell/elemental effect. */

export interface AtmosphereProfile {
  /** Base tint the whole scene is washed with before any light-field/haze modulation. */
  ambientColor: [number, number, number];
  /** How strongly that ambient tint shows through, 0..1-ish (values above 1 are valid and
   * just push it stronger — nothing here clamps to "realistic"). */
  ambientIntensity: number;
  /** Overall brightness multiplier applied once, right before the final grading pass. */
  exposure: number;

  /** World-space tiling of the broad light/shadow field — bigger spans more tiles per swing. */
  lightFieldScale: number;
  /** How fast the light field drifts. Deliberately tiny by default: the point is that the
   * battlefield never looks uniformly lit, not that it visibly crawls. */
  lightFieldSpeed: number;
  /** How far the light field swings between its darkest and brightest spots. */
  lightFieldContrast: number;

  /** How thick the haze reads at its densest. */
  hazeDensity: number;
  /** World-space tiling of the haze noise. */
  hazeScale: number;
  /** How fast the haze drifts across the field. */
  hazeSpeed: number;
  hazeColor: [number, number, number];

  /** Peak brightness of the volumetric light shafts. */
  volumetricIntensity: number;
  /** Direction the shafts rake across the field, radians. */
  volumetricAngle: number;
  /** How fast the shafts drift along their own length. */
  volumetricSpeed: number;
  volumetricColor: [number, number, number];

  /** How many dust/ash/mist motes drift across the visible viewport at once. */
  particleCount: number;
  /** Their drift speed in CSS px/second. */
  particleSpeed: number;
  /** Their radius in CSS px. */
  particleSize: number;
  particleColor: [number, number, number];

  /** Luma above which a pixel of the atmosphere layer itself starts contributing to bloom. */
  bloomThreshold: number;
  /** How strongly that bloom is added back on top. */
  bloomStrength: number;

  /** Post-composite contrast multiplier (1 = unchanged). */
  contrast: number;
  /** Post-composite saturation multiplier (1 = unchanged, 0 = grayscale). */
  saturation: number;
  /** Darkening toward the screen edges, 0 = none. */
  vignette: number;
}

/** Noticeable but not overpowering: the point is a battlefield that visibly breathes (drifting
 * dust, a slow light swing, a thin haze) without ever fogging the map past readability. A
 * mission can push its own `atmosphere` override stronger (storm, ash-fall, heavy fog) without
 * touching this shared default. */
export const DEFAULT_ATMOSPHERE_PROFILE: AtmosphereProfile = {
  ambientColor: [0.55, 0.62, 0.86],
  ambientIntensity: 0.2,
  exposure: 1.08,

  lightFieldScale: 0.85,
  lightFieldSpeed: 0.045,
  lightFieldContrast: 0.42,

  hazeDensity: 0.3,
  hazeScale: 1.7,
  hazeSpeed: 0.1,
  hazeColor: [0.78, 0.82, 0.92],

  volumetricIntensity: 0.28,
  volumetricAngle: 0.4,
  volumetricSpeed: 0.05,
  volumetricColor: [1.0, 0.93, 0.78],

  particleCount: 100,
  particleSpeed: 16,
  particleSize: 2.2,
  particleColor: [0.92, 0.92, 0.88],

  bloomThreshold: 0.5,
  bloomStrength: 0.85,

  contrast: 1.05,
  saturation: 1.03,
  vignette: 0.2,
};
