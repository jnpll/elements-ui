// Based on jnpl/src/components/prism/GlassBackdrop.tsx.
// Cosmo adds a palette tint to its atmosphere; Stellar keeps the original monochrome output.
export const cosmoVertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export const cosmoFragmentShader = /* glsl */ `
uniform vec2 uResolution;
uniform float uTime;
uniform float uDark; // 1 = dark theme, 0 = light theme
uniform vec3 uTint;
uniform float uTintStrength;

// --- Ashima simplex noise (2D) ---
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * snoise(p); p *= 2.0; a *= 0.5; }
  return s;
}

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// --- Subtle particles (light theme) -----------------------------------------
// Plain white with a whisper of soft grey motes: a sparse field of tiny round
// dots that drift slowly upward and gently fade in and out. Deliberately faint
// — barely-there ambient movement rather than a visible starfield.
//
// One drifting layer: only some cells hold a mote, checked over a 3×3
// neighbourhood so dots near a cell edge still render as full circles.
float moteLayer(vec2 p, float density, float drift, float seed){
  p += vec2(uTime * drift * 0.25, uTime * drift); // slow upward-ish drift
  vec2 gv = p * density;
  vec2 cell = floor(gv);
  vec2 f = gv - cell;
  float acc = 0.0;
  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2 o = vec2(float(i), float(j));
      vec2 c = cell + o;
      float rnd = hash21(c + seed);
      if (rnd < 0.62) continue;              // ~38% of cells hold a mote
      vec2 off = vec2(hash21(c + seed + 1.7), hash21(c + seed + 3.3));
      float d = length(f - (o + off));
      float size = mix(0.03, 0.075, hash21(c + seed + 5.1));
      float dot = smoothstep(size, 0.0, d);
      float tw = 0.55 + 0.45 * sin(uTime * (0.35 + rnd * 0.6) + rnd * 6.2831);
      acc += dot * tw;
    }
  }
  return acc;
}

vec3 subtleParticles(vec2 uv, float aspect){
  vec3 bg = vec3(1.0);
  vec2 p = uv;
  p.x *= aspect;

  // Two layers at different scales/speeds for a touch of parallax depth.
  float m = moteLayer(p, 8.0, 0.012, 0.0) * 0.8
          + moteLayer(p, 4.5, 0.007, 21.0) * 0.6;

  vec3 mote = vec3(0.50, 0.56, 0.66);        // soft cool grey
  return mix(bg, mote, clamp(m, 0.0, 1.0) * 0.12); // very faint
}

// A very sparse field of tiny stars — only a few cells hold one; each twinkles
// gently. Kept dim so it reads as a whisper of stars, not a starscape.
float starField(vec2 uv, float density, float thresh){
  vec2 gv = uv * density;
  vec2 cell = floor(gv);
  vec2 f = fract(gv) - 0.5;
  float rnd = hash21(cell);
  if (rnd < thresh) return 0.0;
  vec2 offs = (vec2(hash21(cell + 1.3), hash21(cell + 2.7)) - 0.5) * 0.7;
  float d = length(f - offs);
  float size = mix(0.02, 0.06, hash21(cell + 3.1));
  float star = smoothstep(size, 0.0, d);
  float bright = mix(0.3, 1.0, hash21(cell + 4.2));
  // Twinkle all the way OUT to zero, at a per-star speed + phase, so stars fade
  // in and out rather than just dimming.
  float tw = 0.5 + 0.5 * sin(uTime * (0.8 + rnd * 1.4) + rnd * 6.2831);
  return star * bright * tw;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv;
  p.x *= aspect; // aspect-correct so stars stay round

  float t = uTime * 0.05; // slow, calm drift

  // domain-warped field → smooth, organic pools of light
  vec2 q = p * 1.3;
  q += 0.5 * vec2(fbm(p * 0.7 + vec2(0.0, t)),
                  fbm(p * 0.7 + vec2(t * 0.8, 5.2)));
  float f = fbm(q + vec2(-t * 0.6, t * 0.3));
  float lum = smoothstep(-0.15, 0.9, f);

  // larger, slower layer for depth
  float f2 = fbm(q * 0.5 + vec2(t * 0.2, -t * 0.15));
  float lum2 = smoothstep(0.0, 1.0, 0.5 + 0.5 * f2);

  // faint sheen slowly sweeping across, like light glancing off glass
  float sweep = smoothstep(0.55, 1.0, sin((p.x + p.y) * 1.3 - uTime * 0.12));

  // subtle frosted grain (masks banding, adds glass texture)
  float grain = snoise(p * 90.0 + t * 6.0);

  // Very subtle stars slowly receding into the distance: two crossfaded layers
  // whose coordinates zoom inward, so the field feels like it's drifting away.
  float zt = uTime * 0.012;
  float za = fract(zt);
  float zb = fract(zt + 0.5);
  float wa = 1.0 - abs(za - 0.5) * 2.0; // triangle crossfade windows
  float wb = 1.0 - abs(zb - 0.5) * 2.0;
  float stars = starField(p * pow(2.0, za), 14.0, 0.82) * wa
              + starField(p * pow(2.0, zb), 14.0, 0.82) * wb;

  float vig = smoothstep(1.15, 0.2, length(p));

  // Monochrome — colour is reserved for the prism. Dark theme pools soft light
  // greys on near-black; light theme shades soft greys onto near-white.
  vec3 col;
  if (uDark > 0.5) {
    col = vec3(0.014);
    col += lum  * 0.055 * mix(vec3(0.60), vec3(0.86), lum);
    col += lum2 * 0.030 * vec3(0.60);
    col += sweep * 0.020 * vec3(0.90);
    col += grain * 0.010;
    col += stars * 0.55 * vec3(0.85, 0.9, 1.0);
    col *= mix(0.68, 1.0, vig);
  } else {
    // Light theme → plain white with a whisper of drifting particles.
    col = subtleParticles(uv, aspect);
    col += grain * 0.003;                       // faint grain to mask banding
  }

  // Colour only the ambient haze. Stars and grain retain the source backdrop's contrast.
  if (uTintStrength > 0.5) {
    if (uDark > 0.5) {
      col += uTint * (0.008 + lum * 0.027 + lum2 * 0.014 + sweep * 0.006);
    } else {
      col -= (vec3(1.0) - uTint) * (0.035 + lum * 0.035 + lum2 * 0.015);
    }
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
