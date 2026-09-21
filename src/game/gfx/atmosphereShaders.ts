/** GLSL sources for the global atmospheric rendering pipeline (see AtmosphereRenderer.ts and
 * atmosphereParams.ts). Kept in its own module, deliberately not touching shaders.ts's
 * elemental/spell FX sources — this reuses a couple of THOSE module's plain, generic passes
 * (the fullscreen-triangle vertex shader, the particle mote, the bright-pass/blur pair) by
 * importing them read-only, exactly the way glutil.ts and noiseTexture.ts are already shared
 * infrastructure. Nothing here is spell-specific and nothing in shaders.ts changes. */

const VERSION = "#version 300 es\n";
const PRECISION = "precision highp float;\n";

/** Ambient wash + a slow broad light/shadow field + procedural haze + soft volumetric shafts,
 * combined into one translucent RGBA layer in world space. `u_panOffset` is screen minus world
 * (see BattleEngine.effectAnchor) so the noise fields hold still under camera panning — only
 * their own u_time-driven drift moves them, same convention the water/river shader already
 * uses for exactly the same reason. */
export const FRAG_ATMOSPHERE_MAIN = `${VERSION}${PRECISION}
in vec2 v_uv;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform vec2 u_panOffset;
uniform float u_time;
uniform sampler2D u_noiseTex;
uniform vec3 u_ambientColor;
uniform float u_ambientIntensity;
uniform float u_exposure;
uniform float u_lightFieldScale;
uniform float u_lightFieldSpeed;
uniform float u_lightFieldContrast;
uniform float u_hazeDensity;
uniform float u_hazeScale;
uniform float u_hazeSpeed;
uniform vec3 u_hazeColor;
uniform float u_volumetricIntensity;
uniform float u_volumetricAngle;
uniform float u_volumetricSpeed;
uniform vec3 u_volumetricColor;

float fbm(vec2 uv) {
  return texture(u_noiseTex, uv).r * 0.55
       + texture(u_noiseTex, uv * 2.3 + 3.1).g * 0.3
       + texture(u_noiseTex, uv * 4.7 + 9.4).b * 0.15;
}

void main() {
  vec2 worldPx = v_uv * u_resolution - u_panOffset;

  vec2 lfUV = worldPx / 640.0 * u_lightFieldScale + vec2(0.15, 0.08) * u_time * u_lightFieldSpeed;
  float lightField = fbm(lfUV);
  float litness = (lightField - 0.5) * 2.0 * u_lightFieldContrast;

  vec2 hazeUV = worldPx / 420.0 * u_hazeScale - vec2(0.22, -0.11) * u_time * u_hazeSpeed;
  float hazeNoise = clamp(fbm(hazeUV), 0.0, 1.0);
  float hazeAlpha = hazeNoise * u_hazeDensity;

  vec2 dir = vec2(cos(u_volumetricAngle), sin(u_volumetricAngle));
  float along = dot(worldPx, dir) / 300.0 + u_time * u_volumetricSpeed;
  float shaft = pow(max(0.0, sin(along * 1.7)), 4.0);
  float shaft2 = pow(max(0.0, sin(along * 0.9 + 1.7)), 6.0);
  float volume = (shaft * 0.7 + shaft2 * 0.5) * (0.4 + 0.6 * hazeNoise) * u_volumetricIntensity;

  vec3 color = u_ambientColor * u_ambientIntensity * (1.0 + litness);
  color += u_hazeColor * hazeAlpha * 0.7;
  color += u_volumetricColor * volume;
  color *= u_exposure;

  float alpha = clamp(hazeAlpha * 0.85 + volume * 0.7 + abs(litness) * 0.3, 0.0, 0.92);
  fragColor = vec4(color, alpha);
}
`;

/** Adds the blurred bloom back on top of the main atmosphere layer, then applies contrast/
 * saturation/vignette — the "final color/exposure grading" pass. Vignette is deliberately
 * plain screen-space (v_uv), not world-space: it is a property of the viewport, not the
 * battlefield, and must stay put while the camera pans. */
export const FRAG_ATMOSPHERE_COMPOSITE = `${VERSION}${PRECISION}
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_main;
uniform sampler2D u_bloom;
uniform float u_bloomStrength;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_vignette;

void main() {
  vec4 base = texture(u_main, v_uv);
  vec3 bloom = texture(u_bloom, v_uv).rgb;
  vec3 color = base.rgb + bloom * u_bloomStrength;
  float bloomLuma = max(bloom.r, max(bloom.g, bloom.b));
  float alpha = clamp(base.a + bloomLuma * u_bloomStrength * 0.6, 0.0, 1.0);

  color = (color - 0.5) * u_contrast + 0.5;
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, u_saturation);

  vec2 centered = v_uv - 0.5;
  float vig = 1.0 - u_vignette * clamp(dot(centered, centered) * 2.2, 0.0, 1.0);
  color *= vig;

  fragColor = vec4(max(color, 0.0), alpha);
}
`;
