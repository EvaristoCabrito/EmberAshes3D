/**
 * Fire V2 — test of ONE procedural 3D fireball carrying a real THREE.PointLight (Dev Controls →
 * "Bola de fogo V2 (teste)"). The existing Fireball spell visuals (Fire V1) are untouched; this is
 * a separate object that only exists while the dev switch is on.
 *
 * The ball is a real mesh floating above the board: an icosphere whose vertices are pushed in and
 * out every frame by 3D noise (turbulent, boiling flame surface), colored hot-white in the core
 * through orange to deep red at the flaring edges, plus a softer outer flame shell. A PointLight
 * is a child of the same group, so it sits at the ball's real world position and travels with it.
 */
import * as THREE from "three";

const NOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  float fbm(vec3 p) {
    float f = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { f += a * snoise(p); p *= 2.03; a *= 0.5; }
    return f;
  }
`;

function flameMaterial(amplitude: number, opacity: number, edgeFade: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAmp: { value: amplitude }, uOpacity: { value: opacity } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uAmp;
      varying float vHeat;
      varying vec3 vNormalV;
      varying vec3 vViewDir;
      ${NOISE_GLSL}
      void main() {
        // Boiling surface: the noise field scrolls upward (+Z, toward the camera and away from
        // the board) and churns over time, pushing each vertex in or out along its normal.
        vec3 p = position * 1.6 + vec3(0.0, 0.0, -uTime * 1.4);
        float n = fbm(p + vec3(uTime * 0.35, uTime * 0.2, 0.0));
        vHeat = n;
        vec3 displaced = position + normal * n * uAmp;
        vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
        vNormalV = normalize(normalMatrix * normal);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vHeat;
      varying vec3 vNormalV;
      varying vec3 vViewDir;
      void main() {
        // Facing the viewer = looking into the hot core; grazing = the thin flaring edge.
        float facing = clamp(dot(normalize(vNormalV), normalize(vViewDir)), 0.0, 1.0);
        float heat = clamp(facing * 0.85 + vHeat * 0.6 + 0.15, 0.0, 1.0);
        vec3 red = vec3(0.55, 0.06, 0.01);
        vec3 orange = vec3(1.0, 0.42, 0.05);
        vec3 yellow = vec3(1.0, 0.82, 0.35);
        vec3 white = vec3(1.0, 0.97, 0.88);
        vec3 col = mix(red, orange, smoothstep(0.0, 0.45, heat));
        col = mix(col, yellow, smoothstep(0.45, 0.75, heat));
        col = mix(col, white, smoothstep(0.8, 1.0, heat));
        float alpha = uOpacity * ${edgeFade ? "smoothstep(0.0, 0.55, facing)" : "1.0"};
        gl_FragColor = vec4(col * alpha, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export class FireballV2 {
  readonly group = new THREE.Group();
  /** The real light the fireball carries — a child of `group`, so it moves with it. */
  readonly light: THREE.PointLight;
  private core: THREE.Mesh;
  private shell: THREE.Mesh;
  private coreMat: THREE.ShaderMaterial;
  private shellMat: THREE.ShaderMaterial;

  constructor(decay: number) {
    const geo = new THREE.IcosahedronGeometry(1, 24);
    this.coreMat = flameMaterial(0.28, 1.0, false);
    this.shellMat = flameMaterial(0.55, 0.45, true);
    this.core = new THREE.Mesh(geo, this.coreMat);
    this.shell = new THREE.Mesh(geo, this.shellMat);
    this.shell.scale.setScalar(1.45);
    this.core.renderOrder = 10;
    this.shell.renderOrder = 11;
    this.group.add(this.core, this.shell);
    this.light = new THREE.PointLight(0xff7a2a, 0, 1, decay);
    this.group.add(this.light);
    this.group.visible = false;
  }

  update(time: number): void {
    this.coreMat.uniforms.uTime!.value = time;
    this.shellMat.uniforms.uTime!.value = time * 1.15 + 3.7;
    this.core.rotation.z = time * 0.6;
    this.shell.rotation.z = -time * 0.45;
  }

  dispose(): void {
    this.core.geometry.dispose();
    this.coreMat.dispose();
    this.shellMat.dispose();
  }
}
