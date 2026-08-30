import {
  BASE_COUNTS,
  GALAXY,
} from "components/system/Desktop/Wallpapers/Galaxy/config";

/**
 * Render pass a layer belongs to, in paint order: background (far stars),
 * glow (soft gas, accumulated at reduced resolution), stars (crisp old
 * stars), dust (dark lanes, reduced resolution), foreground (young stars,
 * H-II regions, near field).
 */
export type GalaxyLayerTarget =
  | "background"
  | "dust"
  | "foreground"
  | "glow"
  | "stars";

export type GalaxyLayer = {
  alpha: number;
  count: number;
  data: ArrayBuffer;
  /**
   * Gaussian falloff exponent of the sprite profile. Crisp stars use 4.5;
   * soft media use 3.0 together with `sizeMul` 0.82, which renders the same
   * gaussian sigma on a third less sprite area.
   */
  falloffK: number;
  maxPointSize: number;
  /**
   * Enables the supernova channel: about once a minute one star of the
   * layer flares brilliantly and decays over seconds. Only the young
   * population hosts core-collapse events, so only it sets this to 1.
   */
  novaAmp: number;
  patternMul: number;
  sizeMul: number;
  /**
   * Strength of the four-point diffraction spikes drawn on sprites large
   * enough to read as saturated stars, the signature of telescope optics
   * in NASA/ESA photography. Zero for soft media and small-star layers.
   */
  spikeAmp: number;
  target: GalaxyLayerTarget;
  /**
   * Amplitude of the slow brightness shimmer. There is no atmosphere in
   * space, so this stays subtle: a hint of life standing in for real
   * stellar variability rather than earthly twinkle.
   */
  twinkleAmp: number;
};

// 8 floats (a, axisRatio, theta0, phase0, omegaRel, z, size, twinklePhase)
// followed by 4 unsigned bytes (r, g, b, brightness)
export const PARTICLE_STRIDE = 36;
export const PARTICLE_FLOATS = 8;

const TAU = Math.PI * 2;

/* eslint-disable no-bitwise */
const createRng = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state = Math.trunc(state + 0x6d2b79f5);

    let t = state;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
/* eslint-enable no-bitwise */

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);

  return t * t * (3 - 2 * t);
};

const mix = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;

// Linear sRGB to linear Display P3 (both D65), relative colorimetric
const SRGB_TO_P3 = [
  0.8225, 0.1774, 0, 0.0332, 0.9669, 0, 0.0171, 0.0724, 0.9108,
];

const srgbToLinear = (value: number): number =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (value: number): number =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;

// The gamma curves via ** are the hot spot of generation (six calls per
// particle); interpolated lookup tables are exact to ~1e-5, far below one
// 8-bit color step, and cut the warm-up time roughly in half
const TRANSFER_LUT_SIZE = 2048;

const buildTransferLut = (
  transfer: (value: number) => number
): Float32Array => {
  const lut = new Float32Array(TRANSFER_LUT_SIZE + 1);

  for (let index = 0; index <= TRANSFER_LUT_SIZE; index += 1) {
    lut[index] = transfer(index / TRANSFER_LUT_SIZE);
  }

  return lut;
};

const srgbToLinearLut = buildTransferLut(srgbToLinear);
const linearToSrgbLut = buildTransferLut(linearToSrgb);

const sampleLut = (lut: Float32Array, value: number): number => {
  const scaled = clamp(value, 0, 1) * TRANSFER_LUT_SIZE;
  const index = Math.trunc(scaled);
  const next = lut[Math.min(index + 1, TRANSFER_LUT_SIZE)];

  return lut[index] + (next - lut[index]) * (scaled - index);
};

type ColorGrade = (
  red: number,
  green: number,
  blue: number
) => [number, number, number];

/**
 * Grades a particle color in linear light: converts into Display P3 when the
 * drawing buffer is wide gamut (same hues, but headroom to saturate beyond
 * sRGB like the film scans in NASA photography), then boosts saturation.
 */
const createColorGrade =
  (wideGamut: boolean, saturation: number): ColorGrade =>
  (red, green, blue) => {
    let r = sampleLut(srgbToLinearLut, red / 255);
    let g = sampleLut(srgbToLinearLut, green / 255);
    let b = sampleLut(srgbToLinearLut, blue / 255);

    if (wideGamut) {
      [r, g, b] = [
        SRGB_TO_P3[0] * r + SRGB_TO_P3[1] * g + SRGB_TO_P3[2] * b,
        SRGB_TO_P3[3] * r + SRGB_TO_P3[4] * g + SRGB_TO_P3[5] * b,
        SRGB_TO_P3[6] * r + SRGB_TO_P3[7] * g + SRGB_TO_P3[8] * b,
      ];
    }

    const boost = wideGamut ? saturation : 1 + (saturation - 1) * 0.5;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    r = clamp(luminance + (r - luminance) * boost, 0, 1);
    g = clamp(luminance + (g - luminance) * boost, 0, 1);
    b = clamp(luminance + (b - luminance) * boost, 0, 1);

    return [
      sampleLut(linearToSrgbLut, r) * 255,
      sampleLut(linearToSrgbLut, g) * 255,
      sampleLut(linearToSrgbLut, b) * 255,
    ];
  };

/** Approximate conversion of blackbody temperature (K) to sRGB. */
const kelvinToRgb = (kelvin: number): [number, number, number] => {
  const t = clamp(kelvin, 1500, 40000) / 100;
  let red = 255;
  let blue = 255;
  let green: number;

  if (t > 66) {
    red = 329.698727446 * (t - 60) ** -0.1332047592;
    green = 288.1221695283 * (t - 60) ** -0.0755148492;
  } else {
    green = 99.4708025861 * Math.log(t) - 161.1195681661;
    blue = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  }

  return [clamp(red, 0, 255), clamp(green, 0, 255), clamp(blue, 0, 255)];
};

// Interpolated lookup over the blackbody curve plus a shared result tuple:
// removes both the pow/log calls and the per-call array allocation from the
// ~60k temperature conversions of a generation run (error is sub-1K)
const KELVIN_LUT_SIZE = 512;
const KELVIN_MIN = 1500;
const KELVIN_STEP = (40000 - KELVIN_MIN) / KELVIN_LUT_SIZE;
const kelvinLut = ((): Float32Array => {
  const lut = new Float32Array((KELVIN_LUT_SIZE + 1) * 3);

  for (let index = 0; index <= KELVIN_LUT_SIZE; index += 1) {
    const [red, green, blue] = kelvinToRgb(KELVIN_MIN + KELVIN_STEP * index);

    lut[index * 3] = red;
    lut[index * 3 + 1] = green;
    lut[index * 3 + 2] = blue;
  }

  return lut;
})();
const kelvinScratch: [number, number, number] = [0, 0, 0];

const kelvinRgb = (kelvin: number): [number, number, number] => {
  const scaled = clamp((kelvin - KELVIN_MIN) / KELVIN_STEP, 0, KELVIN_LUT_SIZE);
  const index = Math.trunc(scaled);
  const next = Math.min(index + 1, KELVIN_LUT_SIZE) * 3;
  const fraction = scaled - index;

  for (let channel = 0; channel < 3; channel += 1) {
    const from = kelvinLut[index * 3 + channel];

    kelvinScratch[channel] =
      from + (kelvinLut[next + channel] - from) * fraction;
  }

  return kelvinScratch;
};

type LayerMeta = {
  alpha: number;
  falloffK: number;
  maxPointSize: number;
  novaAmp: number;
  patternMul: number;
  sizeMul: number;
  spikeAmp: number;
  target: GalaxyLayerTarget;
  twinkleAmp: number;
};

type ParticleWriter = {
  add: (
    a: number,
    orbitRatio: number,
    theta0: number,
    phase0: number,
    omegaRel: number,
    z: number,
    size: number,
    twinklePhase: number,
    red: number,
    green: number,
    blue: number,
    brightness: number
  ) => void;
  build: (meta: LayerMeta) => GalaxyLayer;
};

const createWriter = (grade: ColorGrade): ParticleWriter => {
  const values: number[] = [];

  return {
    // Positional push, no rest/spread: this is the hottest call site of
    // generation, and a rest parameter would allocate an array per particle
    add: (
      a,
      orbitRatio,
      theta0,
      phase0,
      omegaRel,
      z,
      size,
      twinklePhase,
      red,
      green,
      blue,
      brightness
    ) => {
      values.push(
        a,
        orbitRatio,
        theta0,
        phase0,
        omegaRel,
        z,
        size,
        twinklePhase,
        red,
        green,
        blue,
        brightness
      );
    },
    build: (meta) => {
      const count = values.length / 12;
      const data = new ArrayBuffer(count * PARTICLE_STRIDE);
      // Two views over the same interleaved buffer: the stride is 9 words,
      // 8 floats followed by 4 packed color bytes
      const floats = new Float32Array(data);
      const bytes = new Uint8Array(data);

      for (let index = 0; index < count; index += 1) {
        const floatOffset = index * 9;
        const valueOffset = index * 12;

        for (let field = 0; field < PARTICLE_FLOATS; field += 1) {
          floats[floatOffset + field] = values[valueOffset + field];
        }

        const colorOffset = index * PARTICLE_STRIDE + PARTICLE_FLOATS * 4;
        const [red, green, blue] = grade(
          values[valueOffset + PARTICLE_FLOATS],
          values[valueOffset + PARTICLE_FLOATS + 1],
          values[valueOffset + PARTICLE_FLOATS + 2]
        );

        bytes[colorOffset] = clamp(Math.round(red), 0, 255);
        bytes[colorOffset + 1] = clamp(Math.round(green), 0, 255);
        bytes[colorOffset + 2] = clamp(Math.round(blue), 0, 255);
        bytes[colorOffset + 3] = clamp(
          Math.round(values[valueOffset + PARTICLE_FLOATS + 3]),
          0,
          255
        );
      }

      return { ...meta, count, data };
    },
  };
};

/** Axis ratio of an orbit: elongated in the bar, near-circular outside. */
const axisRatio = (a: number): number =>
  mix(
    GALAXY.barAxisRatio,
    GALAXY.diskAxisRatio,
    smoothstep(GALAXY.barRadius * 0.6, GALAXY.barRadius * 2.2, a)
  );

/** Major axis rotation by radius, the source of the spiral pattern. */
const armAngle = (a: number): number => a * GALAXY.armWinding;

/** Flat rotation curve, relative to the pattern's own rotation. */
const relativeOrbitalSpeed = (a: number): number =>
  GALAXY.orbitalSpeed / Math.max(a, 0.08) - GALAXY.patternSpeed;

/**
 * Disk thickness, flaring towards the rim. The Milky Way's thin disk scale
 * height is roughly 300 pc against a 13 kpc disk radius, i.e. razor thin.
 */
const diskHeight = (a: number): number => 0.012 + 0.032 * a;

const sampleDiskRadius = (
  random: () => number,
  scaleLength: number
): number => {
  let a = 0;
  let accepted = false;

  while (!accepted) {
    a = -scaleLength * Math.log(1 - random());
    // Beyond the break the disk truncates along a steeper exponential
    // (Type II profile) rather than at a hard edge
    accepted =
      a >= 0.02 &&
      a <= GALAXY.maxRadius &&
      (a <= GALAXY.outerBreak ||
        random() < Math.exp(-(a - GALAXY.outerBreak) / GALAXY.outerScale));
  }

  return a;
};

// Box-Muller produces two independent normals per log/sqrt evaluation;
// caching the spare halves the transcendental work across the hundreds of
// thousands of draws generation makes. Reset per run for determinism.
let gaussianSpare: number | undefined;

const gaussian = (random: () => number): number => {
  if (gaussianSpare !== undefined) {
    const value = gaussianSpare;

    gaussianSpare = undefined;

    return value;
  }

  const u = Math.max(random(), 1e-9);
  const angle = TAU * random();
  const magnitude = Math.sqrt(-2 * Math.log(u));

  gaussianSpare = magnitude * Math.sin(angle);

  return magnitude * Math.cos(angle);
};

const spread = (random: () => number, amount: number): number =>
  gaussian(random) * amount;

const MINOR_ARM_PHASE = Math.PI / 2;
const SPUR_PHASE = Math.PI * 0.28;
const SPUR_RADIUS = 0.6;

type ArmPlacement = { phase: number; radius: number; widthMul: number };

/**
 * Distributes arm tracers the way the Milky Way does: two dominant arms
 * (Scutum-Centaurus, Perseus) at the ellipse apoapsides, two weaker minor
 * arms (Sagittarius, Norma) a quarter turn away, and the short Local (Orion)
 * Spur between them - the Sun's home.
 */
const placeOnArm = (
  random: () => number,
  a: number,
  minorShare: number,
  spurShare: number
): ArmPlacement => {
  const roll = random();

  if (roll < spurShare) {
    const radius = SPUR_RADIUS + spread(random, 0.045);

    return {
      phase: SPUR_PHASE + (radius - SPUR_RADIUS) * 2.5,
      radius,
      widthMul: 0.5,
    };
  }

  if (roll < spurShare + minorShare && a > 0.3) {
    return {
      phase: (random() < 0.5 ? 1 : -1) * MINOR_ARM_PHASE,
      radius: a,
      widthMul: 0.7,
    };
  }

  return { phase: random() < 0.5 ? 0 : Math.PI, radius: a, widthMul: 1 };
};

export const generateGalaxy = (
  quality = 1,
  wideGamut = false,
  seed = 0x1a2b3c4d
): GalaxyLayer[] => {
  const random = createRng(seed);

  gaussianSpare = undefined;

  const scaled = (count: number): number => Math.round(count * quality);
  const grade = (saturation: number): ColorGrade =>
    createColorGrade(wideGamut, saturation);

  // Far background starfield on a large sphere
  const farStars = createWriter(grade(1.06));

  for (let index = 0; index < scaled(BASE_COUNTS.farStars); index += 1) {
    const azimuth = random() * TAU;
    const cosPolar = random() * 2 - 1;
    const sinPolar = Math.sqrt(1 - cosPolar * cosPolar);
    const radius = 7 + random() * 3;
    const warmth = random();
    let [red, green, blue] = [235, 235, 240];

    if (warmth < 0.1) {
      [red, green, blue] = kelvinRgb(3400 + random() * 1600);
    } else if (warmth < 0.22) {
      [red, green, blue] = kelvinRgb(9000 + random() * 12000);
    }

    farStars.add(
      radius * sinPolar,
      1,
      azimuth,
      0,
      0,
      radius * cosPolar,
      0.025 + random() ** 3 * 0.045,
      random() * TAU,
      red,
      green,
      blue,
      70 + random() * 180
    );
  }

  // Globular clusters: the Milky Way hosts ~150, in two families (Zinn
  // 1985): metal-rich clusters concentrated toward the bulge in a mildly
  // flattened system, and metal-poor clusters strewn through the halo
  // along the same steep power-law profile as its field stars
  const globulars = createWriter(grade(1.06));
  const GC_CDF_INNER = 0.22 ** -0.5;
  const GC_CDF_OUTER = 1.6 ** -0.5;

  for (
    let index = 0;
    index < scaled(BASE_COUNTS.globularClusters);
    index += 1
  ) {
    const azimuth = random() * TAU;
    const cosPolar = random() * 2 - 1;
    const sinPolar = Math.sqrt(1 - cosPolar * cosPolar);
    const metalRich = random() < 0.3;
    const radius = metalRich
      ? 0.08 + random() ** 2 * 0.3
      : (GC_CDF_INNER - random() * (GC_CDF_INNER - GC_CDF_OUTER)) ** -2;
    // Metal-poor clusters shine bluer: a warmer giant branch plus blue
    // horizontal-branch stars, against the redder metal-rich population
    const [red, green, blue] = kelvinRgb(
      metalRich ? 4300 + random() * 700 : 5000 + random() * 1200
    );

    globulars.add(
      radius * sinPolar,
      1,
      azimuth,
      0,
      0,
      radius * cosPolar * (metalRich ? 0.6 : 1),
      0.012 + random() * 0.012,
      random() * TAU,
      red,
      green,
      blue,
      70 + random() * 60
    );
  }

  // Smooth stellar halo: the sparse spheroid of ancient metal-poor stars
  // that deep exposures reveal around every large spiral, falling off
  // steeply with radius (~r^-3.5) and mildly flattened toward the disk
  const HALO_CDF_INNER = 0.3 ** -0.5;
  const HALO_CDF_OUTER = 1.7 ** -0.5;

  for (let index = 0; index < scaled(BASE_COUNTS.haloStars); index += 1) {
    const azimuth = random() * TAU;
    const cosPolar = random() * 2 - 1;
    const sinPolar = Math.sqrt(1 - cosPolar * cosPolar);
    // Inverse-CDF draw from the r^-3.5 profile between 0.3 and 1.7 radii
    const radius =
      (HALO_CDF_INNER - random() * (HALO_CDF_INNER - HALO_CDF_OUTER)) ** -2;
    const [red, green, blue] = kelvinRgb(4200 + random() * 1800);

    farStars.add(
      radius * sinPolar,
      1,
      azimuth,
      0,
      0,
      radius * cosPolar * 0.6,
      0.003 + random() ** 2 * 0.004,
      random() * TAU,
      red,
      green,
      blue,
      // Barely-there: the halo must read as scattered grains on a close
      // look, never as a visible shell ringing the galaxy
      10 + random() * 14
    );
  }

  // Soft gas glow forming the luminous disk. No glow clouds off the plane:
  // a real stellar halo's surface brightness sits far below the sky - the
  // space around a galaxy looks empty to the eye, and stray puffs read as
  // a distracting shell around the disk
  const diskGlow = createWriter(grade(1.16));

  for (let index = 0; index < scaled(BASE_COUNTS.diskGlow); index += 1) {
    const a = sampleDiskRadius(random, GALAXY.diskScaleLength + 0.04);
    const onMinorArm = a > 0.3 && random() < 0.14;
    const coreness = 1 - smoothstep(0.05, 0.55, a);
    const rim = smoothstep(0.62, 1.05, a);
    const red = mix(onMinorArm ? 158 : 172, 255, coreness);
    const green = mix(onMinorArm ? 190 : 196, 228, coreness);
    const blue = mix(240, 188, coreness);

    diskGlow.add(
      a,
      axisRatio(a),
      armAngle(a) + spread(random, 0.1),
      onMinorArm
        ? (random() < 0.5 ? 1 : -1) * MINOR_ARM_PHASE + spread(random, 0.3)
        : random() * TAU,
      onMinorArm ? 0 : relativeOrbitalSpeed(a),
      spread(random, diskHeight(a) * 1.4),
      // Rim clouds shrink as well as dim: small faint sprites read as
      // granular cloud texture, large faint ones read as blur
      (0.035 + random() ** 2 * 0.085) * mix(1, 0.55, rim),
      random() * TAU,
      red,
      green,
      blue,
      (8 + random() * 10) *
        mix(0.3, 1, smoothstep(0.02, 0.3, a)) *
        mix(1, 0.34, rim)
    );
  }

  // Bar and central bulge glow
  const bulgeGlow = createWriter(grade(1.12));

  for (let index = 0; index < scaled(BASE_COUNTS.bulgeGlow); index += 1) {
    const isCore = random() < 0.25;
    const x = spread(random, isCore ? 0.05 : 0.16);
    const y = spread(random, isCore ? 0.045 : 0.085);
    // Population II light: the bulge shines with old, cool stars, so its
    // glow sits firmly in the warm 4000-5000K range rather than pale white
    const [red, green, blue] = isCore ? [255, 232, 194] : [255, 212, 158];

    bulgeGlow.add(
      Math.hypot(x, y),
      1,
      Math.atan2(y, x),
      0,
      0,
      spread(random, isCore ? 0.04 : 0.06),
      isCore ? 0.03 + random() * 0.07 : 0.06 + random() * 0.13,
      random() * TAU,
      red,
      green,
      blue,
      isCore ? 3 + random() * 4 : 2 + random() * 3
    );
  }

  // Smooth luminosity profile of the central bulge
  for (let index = 0; index < scaled(200); index += 1) {
    const shell = random();

    bulgeGlow.add(
      Math.abs(spread(random, 0.02)),
      1,
      random() * TAU,
      0,
      0,
      spread(random, 0.015),
      0.06 + shell ** 2 * 0.42,
      random() * TAU,
      255,
      mix(235, 215, shell),
      mix(200, 162, shell),
      1.5 + (1 - shell) * 3.5
    );
  }

  // Main stellar population
  const oldStars = createWriter(grade(1.14));

  for (let index = 0; index < scaled(BASE_COUNTS.oldStars); index += 1) {
    const inBulge = random() < 0.16;
    let a = 0;
    let z = 0;
    let theta0 = 0;
    let phase0 = random() * TAU;
    let ratio = 1;
    let temperature = 0;
    let brightness = 60 + random() * 110;

    if (inBulge) {
      a = Math.abs(gaussian(random)) * GALAXY.bulgeRadius;
      z = spread(random, 0.35 * Math.max(a, 0.03));
      phase0 = random() * TAU;
      temperature = 3500 + random() * 1900;
      brightness = 10 + random() * 16;
    } else {
      // A fraction of old stars belong to the thick disk: an older, redder
      // population at roughly triple the scale height that softens the
      // knife-edge profile of the disk seen at an angle
      const inThickDisk = random() < 0.14;

      a = sampleDiskRadius(random, GALAXY.diskScaleLength);
      ratio = axisRatio(a);
      theta0 = armAngle(a) + spread(random, 0.06);
      z = spread(random, diskHeight(a) * (inThickDisk ? 2.8 : 1));
      temperature = inThickDisk
        ? 3600 + random() ** 2 * 2600
        : 3800 + random() ** 2 * 3600;
      // Inside-out disk growth: the outer disk is younger and metal-poor,
      // so its stellar population runs bluer than the inner disk
      if (!inThickDisk) temperature += smoothstep(0.55, 1.05, a) * 900;
      brightness *=
        (inThickDisk ? 0.7 : 1) * mix(0.3, 1, smoothstep(0.06, 0.32, a));
    }

    // Bright stars skew heavily toward red giants, as in the Gaia
    // colour-magnitude diagram where the giant branch dominates at the
    // top - and a few of those are carbon stars, sooty atmospheres
    // burning a startling deep red (the R Leporis "Crimson Star" look)
    const isBright = random() < 0.006;
    let brightTemperature = temperature;

    if (isBright) {
      const giantRoll = random();

      if (giantRoll < 0.06) brightTemperature = 2200 + random() * 500;
      else if (giantRoll < 0.58) brightTemperature = 3300 + random() * 900;
    }

    const [red, green, blue] = kelvinRgb(brightTemperature);
    const size = isBright
      ? 0.013 + random() * 0.012
      : 0.0035 + random() ** 2 * 0.005;

    oldStars.add(
      a,
      ratio,
      theta0,
      phase0,
      relativeOrbitalSpeed(a),
      z,
      size,
      random() * TAU,
      red,
      green,
      blue,
      isBright ? 235 : brightness
    );

    // Halation: saturated giants bleed a soft wide halo of their own color,
    // the way blown-out stars glow through the optics of a long exposure.
    // Same orbit parameters, so the halo rides its star exactly
    if (isBright) {
      diskGlow.add(
        a,
        ratio,
        theta0,
        phase0,
        relativeOrbitalSpeed(a),
        z,
        size * (3 + random() * 1.5),
        random() * TAU,
        red,
        green,
        blue,
        4 + random() * 4
      );
    }
  }

  // One unremarkable G-type star rides the Local Spur about two-thirds of
  // the way out, a whisker above the midplane - the Sun, exactly where it
  // belongs, overtaking the spiral pattern from inside corotation
  const [sunRed, sunGreen, sunBlue] = kelvinRgb(5778);

  oldStars.add(
    SPUR_RADIUS,
    axisRatio(SPUR_RADIUS),
    armAngle(SPUR_RADIUS),
    SPUR_PHASE,
    relativeOrbitalSpeed(SPUR_RADIUS),
    0.002,
    0.0045,
    random() * TAU,
    sunRed,
    sunGreen,
    sunBlue,
    110
  );

  // Dark dust lanes hugging the inner edge of the arms. The particle color
  // is a per-channel ABSORPTION vector, not a paint color: interstellar
  // extinction (R_V = 3.1) removes blue light preferentially, so starlight
  // seen through a lane is dimmed AND reddened, as in real photographs
  const dust = createWriter(grade(1));
  const dustBudget = scaled(BASE_COUNTS.dust);
  let dustEmitted = 0;
  const addDustPuff = (
    a: number,
    theta0: number,
    phase0: number,
    size: number,
    opacity: number
  ): void => {
    const shade = 0.7 + random() * 0.3;
    // The dust column thins with the gas toward the disk edge
    const rimThin = 1 - smoothstep(0.85, 1.05, a) * 0.35;

    dust.add(
      a,
      axisRatio(a),
      theta0,
      phase0,
      0,
      spread(random, diskHeight(a) * 0.4),
      size,
      random() * TAU,
      142,
      190,
      255,
      opacity * shade * rimThin
    );
    dustEmitted += 1;
  };

  while (dustEmitted < dustBudget) {
    const sampledA = 0.3 + random() ** 1.3 * 0.72;

    if (random() < 0.18) {
      // Diffuse dust scattered through the disk
      addDustPuff(
        sampledA * (1 + spread(random, 0.015)),
        armAngle(sampledA) + GALAXY.dustLaneOffset * 0.2 + spread(random, 0.03),
        random() * TAU,
        0.025 + random() ** 1.5 * 0.05,
        13 + random() * 16
      );
    } else {
      const { phase, radius, widthMul } = placeOnArm(
        random,
        sampledA,
        0.22,
        0.05
      );
      const laneTheta =
        armAngle(radius) + GALAXY.dustLaneOffset * 0.2 + spread(random, 0.03);
      const lanePhase =
        phase + spread(random, (0.2 + radius * 0.08) * widthMul);

      if (random() < 0.4 && dustEmitted + 3 <= dustBudget) {
        // Filamentary structure: usually a chain of puffs streaking along
        // the lane, sometimes a feather - a short dusty spur peeling off
        // the shock front downstream across the arm, the texture Hubble
        // resolves throughout M51's arms (La Vigne et al. 2006)
        const isFeather = random() < 0.35;

        for (let link = -1; link <= 1; link += 1) {
          if (isFeather) {
            const along = link + 1;
            const step = along * (0.011 + random() * 0.007);

            addDustPuff(
              radius + spread(random, 0.004),
              laneTheta + step + spread(random, 0.006),
              lanePhase + spread(random, 0.015),
              (0.02 + random() ** 1.5 * 0.036) * (1 - along * 0.12),
              (21 + random() * 24) * (1 - along * 0.16)
            );
          } else {
            const deltaA = link * (0.008 + random() * 0.01);

            addDustPuff(
              radius + deltaA,
              laneTheta + deltaA * GALAXY.armWinding + spread(random, 0.008),
              lanePhase + spread(random, 0.02),
              0.02 + random() ** 1.5 * 0.04,
              21 + random() * 27
            );
          }
        }
      } else {
        addDustPuff(
          radius * (1 + spread(random, 0.015)),
          laneTheta,
          lanePhase,
          0.025 + random() ** 1.5 * 0.05,
          24 + random() * 32
        );
      }
    }
  }

  // Young hot blue stars tracing the arms
  const youngStars = createWriter(grade(1.2));
  const addYoungStar = (
    a: number,
    theta0: number,
    phase0: number,
    sizeBoost: number,
    age = 0.5
  ): void => {
    // Stellar age maps to temperature: newborn O/B stars fresh off the
    // shock front burn electric blue, while survivors that have drifted
    // downstream have lost their brightest members and settle toward the
    // white-yellow of longer-lived masses
    const [red, green, blue] = kelvinRgb(
      mix(12500 + random() ** 2 * 17500, 6600 + random() * 2600, age)
    );

    youngStars.add(
      a,
      axisRatio(a),
      theta0,
      phase0,
      0,
      spread(random, diskHeight(a) * 0.4),
      (0.004 + random() ** 2 * 0.008) * sizeBoost,
      random() * TAU,
      red,
      green,
      blue,
      // Star formation weakens toward the disk edge, so the outer arms
      // fade out instead of ending abruptly
      (120 + random() * 135) * mix(1, 0.4, smoothstep(0.86, 1.1, a))
    );
  };

  // Spiral shock sequence across an arm (Roberts 1969; Bonnell & Dobbs
  // 2006): the dust lane marks the shock on the upstream edge, H-II regions
  // ignite at the shock front, newborn blue stars drift slightly downstream
  const YOUNG_STAR_DRIFT = 0.025;

  for (let index = 0; index < scaled(BASE_COUNTS.youngStars); index += 1) {
    const sampledA = 0.24 + random() * 0.82;
    const { phase, radius, widthMul } = placeOnArm(
      random,
      sampledA,
      0.14,
      0.04
    );
    // Density waves spawn stars at the shock and let them go: the youngest
    // crowd in a tight sheet at the arm's leading edge while older ones
    // smear downstream in an ever more diffuse (and redder) trail, giving
    // each arm a sharp blue edge and a soft fading wake
    const age = random() * random();

    addYoungStar(
      radius,
      armAngle(radius) +
        YOUNG_STAR_DRIFT +
        age * 0.075 +
        spread(random, 0.012 + age * 0.045),
      phase + spread(random, (0.24 + radius * 0.1) * widthMul),
      1,
      age
    );
  }

  // XUV disc: GALEX found faint knots of star formation scattered well
  // beyond the classical edge of most spirals - the disc dissolves outward
  // into sparse, dim, blue specks rather than stopping
  for (let index = 0; index < scaled(300); index += 1) {
    const a = 1.02 + random() ** 1.4 * 0.22;
    const [red, green, blue] = kelvinRgb(9000 + random() ** 2 * 14000);

    youngStars.add(
      a,
      axisRatio(a),
      armAngle(a) + spread(random, 0.25),
      random() * TAU,
      relativeOrbitalSpeed(a),
      spread(random, diskHeight(a) * 0.8),
      0.003 + random() ** 2 * 0.004,
      random() * TAU,
      red,
      green,
      blue,
      25 + random() * 35
    );
  }

  // Runaway OB stars: roughly a fifth of O stars are flung from their
  // birth clusters by dynamical kicks or a companion's supernova, and
  // burn out mid-flight far from any arm (AE Aurigae, Mu Columbae)
  for (let index = 0; index < scaled(120); index += 1) {
    const a = 0.25 + random() * 0.75;
    const [red, green, blue] = kelvinRgb(14000 + random() ** 2 * 16000);

    youngStars.add(
      a,
      axisRatio(a),
      armAngle(a) + spread(random, 0.4),
      random() * TAU,
      relativeOrbitalSpeed(a),
      spread(random, diskHeight(a) * 1.3),
      0.003 + random() ** 2 * 0.005,
      random() * TAU,
      red,
      green,
      blue,
      70 + random() * 90
    );
  }

  // Star forming H-II regions: pink emission knots with embedded clusters
  const h2Regions = createWriter(grade(1.28));

  for (let index = 0; index < scaled(BASE_COUNTS.h2Regions); index += 1) {
    const sampledA = 0.3 + random() * 0.72;
    const { phase, radius, widthMul } = placeOnArm(
      random,
      sampledA,
      0.18,
      0.05
    );
    const phaseCenter = phase + spread(random, 0.22 * widthMul);
    const thetaCenter = armAngle(radius) + 0.008 + spread(random, 0.04);
    // The outermost regions glow fainter, matching the declining star
    // formation at the disk edge
    const rimFade = mix(1, 0.45, smoothstep(0.86, 1.06, radius));
    // Superbubble shells: in about a fifth of the regions the embedded
    // cluster's winds and first supernovae have swept the gas into a ring
    // around it (like N44 in the LMC), instead of a filled blob
    const isShell = random() < 0.2;
    const shellRadius = 0.007 + random() * 0.007;
    const knots = isShell
      ? 5 + Math.trunc(random() * 3)
      : 3 + Math.trunc(random() * 5);

    for (let knot = 0; knot < knots; knot += 1) {
      const pink = random();
      const shellAngle = ((knot + random() * 0.4) / knots) * TAU;
      const radial = isShell
        ? Math.cos(shellAngle) * shellRadius
        : spread(random, 0.012);
      const tangential = isShell
        ? (Math.sin(shellAngle) * shellRadius) / Math.max(radius, 0.3)
        : spread(random, 0.035);

      h2Regions.add(
        radius + radial,
        axisRatio(radius),
        thetaCenter + (isShell ? spread(random, 0.002) : spread(random, 0.01)),
        phaseCenter + tangential,
        0,
        spread(random, 0.008),
        isShell ? 0.012 + random() ** 2 * 0.018 : 0.016 + random() ** 2 * 0.036,
        random() * TAU,
        255,
        mix(74, 124, pink),
        mix(122, 168, pink),
        (26 + random() * 40) * rimFade
      );
    }

    // The ionizing envelope: the knots sit inside a wider, fainter haze of
    // H-alpha emission, so each region reads as a glowing gas cloud rather
    // than a cluster of pink star points
    const envelopes = 1 + Math.trunc(random() * 2);

    for (let patch = 0; patch < envelopes; patch += 1) {
      h2Regions.add(
        radius + spread(random, 0.006),
        axisRatio(radius),
        thetaCenter + spread(random, 0.006),
        phaseCenter + spread(random, 0.025),
        0,
        spread(random, 0.006),
        0.032 + random() ** 2 * 0.05,
        random() * TAU,
        255,
        88,
        132,
        (5 + random() * 8) * rimFade
      );
    }

    const clusterStars = 4 + Math.trunc(random() * 8);

    for (let star = 0; star < clusterStars; star += 1) {
      // Embedded clusters are the regions' newborns, still at the shock
      addYoungStar(
        radius + spread(random, 0.01),
        thetaCenter + spread(random, 0.008),
        phaseCenter + spread(random, 0.03),
        1.25,
        random() * 0.2
      );
    }

    // Blue reflection nebulae: dust beside the cluster scattering the light
    // of the young stars (the Pleiades look), offset downstream with them
    const reflections = 1 + Math.trunc(random() * 2);

    for (let patch = 0; patch < reflections; patch += 1) {
      h2Regions.add(
        radius + spread(random, 0.014),
        axisRatio(radius),
        thetaCenter + 0.015 + spread(random, 0.012),
        phaseCenter + spread(random, 0.04),
        0,
        spread(random, 0.008),
        0.014 + random() ** 2 * 0.03,
        random() * TAU,
        135,
        172,
        255,
        (12 + random() * 12) * rimFade
      );
    }
  }

  // Planetary nebulae: dying sunlike stars blow luminous shells that glow
  // teal in doubly-ionized oxygen. They trace the older disk population
  // rather than the arms, so the tiny cyan motes turn up between them
  for (let index = 0; index < scaled(70); index += 1) {
    const a = Math.max(sampleDiskRadius(random, GALAXY.diskScaleLength), 0.14);

    h2Regions.add(
      a,
      axisRatio(a),
      armAngle(a) + spread(random, 0.3),
      random() * TAU,
      relativeOrbitalSpeed(a),
      spread(random, diskHeight(a) * 1.6),
      0.0035 + random() * 0.0035,
      random() * TAU,
      120,
      235,
      205,
      8 + random() * 10
    );
  }

  // Open star clusters: compact families born together. The older ones
  // have decoupled from the spiral pattern and orbit with the disk, so
  // they show up between the arms too, like the Hyades and M67
  for (let index = 0; index < scaled(BASE_COUNTS.openClusters); index += 1) {
    const a = 0.3 + random() * 0.72;
    const clusterTheta = armAngle(a);
    const clusterPhase = random() * TAU;
    const clusterOmega = relativeOrbitalSpeed(a);
    const clusterZ = spread(random, diskHeight(a) * 0.7);
    // Cluster age sets its color: young ones blue-white, old ones sunny
    const baseTemperature = 5200 + random() ** 2 * 9000;
    const members = 5 + Math.trunc(random() * 8);
    // A few clusters keep a red supergiant, the way h and chi Persei
    // hang on to their handful of ruby stars among the blue
    const hasSupergiant = random() < 0.25;

    for (let member = 0; member < members; member += 1) {
      const isSupergiant = hasSupergiant && member === 0;
      const [red, green, blue] = kelvinRgb(
        isSupergiant
          ? 3450 + random() * 300
          : baseTemperature * (0.75 + random() * 0.5)
      );

      youngStars.add(
        a + spread(random, 0.005),
        axisRatio(a),
        clusterTheta + spread(random, 0.005),
        clusterPhase + spread(random, 0.01),
        clusterOmega,
        clusterZ + spread(random, 0.004),
        (0.0035 + random() ** 2 * 0.005) * (isSupergiant ? 1.7 : 1),
        random() * TAU,
        red,
        green,
        blue,
        isSupergiant ? 170 + random() * 60 : 90 + random() * 110
      );
    }
  }

  // Near field stars for depth parallax: sparse, small and kept far from
  // the camera so they read as crisp foreground points, never as blurry
  // blobs upstaging the galaxy
  const nearStars = createWriter(grade(1.08));

  for (let index = 0; index < scaled(BASE_COUNTS.nearStars); index += 1) {
    const azimuth = random() * TAU;
    const cosPolar = random() * 2 - 1;
    const sinPolar = Math.sqrt(1 - cosPolar * cosPolar);
    const radius = 1.05 + random() * 0.35;
    const warmth = random();
    let [red, green, blue] = [240, 238, 245];

    if (warmth < 0.18) {
      [red, green, blue] = kelvinRgb(3200 + random() * 1500);
    } else if (warmth < 0.36) {
      [red, green, blue] = kelvinRgb(10000 + random() * 15000);
    }

    nearStars.add(
      radius * sinPolar,
      1,
      azimuth,
      0,
      0,
      radius * cosPolar,
      0.003 + random() ** 2 * 0.004,
      random() * TAU,
      red,
      green,
      blue,
      80 + random() * 80
    );
  }

  // Deep sky surroundings: the Magellanic Cloud satellites below the disk
  // and a sprinkling of distant background galaxies as elongated smudges
  const deepSky = createWriter(grade(1.08));
  // The Clouds are structured dwarfs, not round blobs: the LMC is a barred
  // one-armed disc and the SMC an elongated irregular, so each satellite
  // clump is drawn from an anisotropic spread at its own position angle
  const addSatellite = (
    centerX: number,
    centerY: number,
    z: number,
    majorSpread: number,
    minorSpread: number,
    positionAngle: number,
    sprites: number
  ): void => {
    const cosAngle = Math.cos(positionAngle);
    const sinAngle = Math.sin(positionAngle);

    for (let sprite = 0; sprite < sprites; sprite += 1) {
      const along = spread(random, majorSpread);
      const across = spread(random, minorSpread);
      const x = centerX + along * cosAngle - across * sinAngle;
      const y = centerY + along * sinAngle + across * cosAngle;
      const isH2Knot = random() < 0.12;

      deepSky.add(
        Math.hypot(x, y),
        1,
        Math.atan2(y, x),
        0,
        0,
        z + spread(random, minorSpread * 0.9),
        isH2Knot ? 0.012 + random() * 0.01 : 0.02 + random() * 0.045,
        random() * TAU,
        isH2Knot ? 255 : 205,
        isH2Knot ? 130 : 212,
        isH2Knot ? 165 : 236,
        isH2Knot ? 16 + random() * 12 : 7 + random() * 9
      );
    }
  };

  // The Magellanic Clouds are a bound pair, not independent wanderers: the
  // SMC trails the LMC closely, and the Magellanic Bridge of stripped gas
  // and stars ties them together
  const lmcAzimuth = random() * TAU;
  const smcAzimuth = lmcAzimuth + 0.4 + random() * 0.2;
  const lmcX = 1.3 * Math.cos(lmcAzimuth);
  const lmcY = 1.3 * Math.sin(lmcAzimuth);
  const smcX = 1.55 * Math.cos(smcAzimuth);
  const smcY = 1.55 * Math.sin(smcAzimuth);
  const lmcBarAngle = random() * TAU;

  addSatellite(lmcX, lmcY, -0.85, 0.1, 0.055, lmcBarAngle, 32);
  // The SMC's wing points back along the gas bridge toward its companion
  addSatellite(
    smcX,
    smcY,
    -1.05,
    0.07,
    0.032,
    Math.atan2(lmcY - smcY, lmcX - smcX),
    18
  );

  // 30 Doradus, the Tarantula Nebula: the most luminous star-forming
  // region of the Local Group blazes at one end of the LMC's bar - the
  // pink beacon that identifies the LMC at a glance
  for (let knot = 0; knot < 3; knot += 1) {
    const along = 0.09 + spread(random, 0.01);
    const across = spread(random, 0.012);
    const x =
      lmcX + along * Math.cos(lmcBarAngle) - across * Math.sin(lmcBarAngle);
    const y =
      lmcY + along * Math.sin(lmcBarAngle) + across * Math.cos(lmcBarAngle);

    deepSky.add(
      Math.hypot(x, y),
      1,
      Math.atan2(y, x),
      0,
      0,
      -0.85 + spread(random, 0.012),
      knot === 0 ? 0.016 + random() * 0.008 : 0.009 + random() * 0.006,
      random() * TAU,
      255,
      120,
      150,
      knot === 0 ? 26 + random() * 10 : 15 + random() * 8
    );
  }

  for (let index = 0; index < scaled(26); index += 1) {
    const along = random();
    const x = mix(lmcX, smcX, along) + spread(random, 0.03);
    const y = mix(lmcY, smcY, along) + spread(random, 0.03);

    deepSky.add(
      Math.hypot(x, y),
      1,
      Math.atan2(y, x),
      0,
      0,
      mix(-0.85, -1.05, along) + spread(random, 0.03),
      0.018 + random() * 0.025,
      random() * TAU,
      205,
      216,
      238,
      1.6 + random() * 2
    );
  }

  // Tidal stellar stream: a sparse arc of old stars wrapping the halo on an
  // inclined orbit, the wreckage of a consumed dwarf galaxy (like the real
  // Sagittarius stream around the Milky Way)
  const streamNode = random() * TAU;
  const streamInclination = 0.9 + random() * 0.5;
  const streamArc = random() * TAU;

  for (let index = 0; index < scaled(240); index += 1) {
    const along = streamArc + (random() - 0.5) * 4.2;
    const ringRadius = 1.35 + spread(random, 0.06) + 0.12 * Math.sin(along * 2);
    const inPlaneX = ringRadius * Math.cos(along);
    const inPlaneY = ringRadius * Math.sin(along) * Math.cos(streamInclination);
    const x = inPlaneX * Math.cos(streamNode) - inPlaneY * Math.sin(streamNode);
    const y = inPlaneX * Math.sin(streamNode) + inPlaneY * Math.cos(streamNode);
    const [red, green, blue] = kelvinRgb(4700 + random() * 1100);

    deepSky.add(
      Math.hypot(x, y),
      1,
      Math.atan2(y, x),
      0,
      0,
      ringRadius * Math.sin(along) * Math.sin(streamInclination) +
        spread(random, 0.05),
      0.01 + random() * 0.007,
      random() * TAU,
      red,
      green,
      blue,
      // Streams are among the faintest structures in deep exposures; keep
      // this a whisper so it never draws the eye from the galaxy itself
      8 + random() * 10
    );
  }

  // The stream's progenitor still travels at the head of the arc it sheds:
  // a dense knot of the dissolving dwarf's remaining stars, the way the
  // actual Sagittarius dwarf rides its own debris stream
  for (let index = 0; index < scaled(30); index += 1) {
    const along = streamArc + spread(random, 0.045);
    const ringRadius =
      1.35 + spread(random, 0.025) + 0.12 * Math.sin(along * 2);
    const inPlaneX = ringRadius * Math.cos(along);
    const inPlaneY = ringRadius * Math.sin(along) * Math.cos(streamInclination);
    const x = inPlaneX * Math.cos(streamNode) - inPlaneY * Math.sin(streamNode);
    const y = inPlaneX * Math.sin(streamNode) + inPlaneY * Math.cos(streamNode);
    const [red, green, blue] = kelvinRgb(4600 + random() * 1200);

    deepSky.add(
      Math.hypot(x, y),
      1,
      Math.atan2(y, x),
      0,
      0,
      ringRadius * Math.sin(along) * Math.sin(streamInclination) +
        spread(random, 0.02),
      0.01 + random() * 0.007,
      random() * TAU,
      red,
      green,
      blue,
      12 + random() * 12
    );
  }

  for (let index = 0; index < 18; index += 1) {
    const azimuth = random() * TAU;
    // Zone of avoidance: the dusty disk hides galaxies near the plane
    const cosPolar = (0.25 + random() * 0.75) * (random() < 0.5 ? -1 : 1);
    const sinPolar = Math.sqrt(1 - cosPolar * cosPolar);
    const distance = 6.5 + random() * 2.5;
    const center = [
      distance * sinPolar * Math.cos(azimuth),
      distance * sinPolar * Math.sin(azimuth),
      distance * cosPolar,
    ];
    const tilt = random() * TAU;
    const alongZ = Math.sin(tilt) * (random() * 2 - 1);
    // The first is an Andromeda analog: the one companion spiral large and
    // bright enough to stand out from the field of anonymous smudges
    const isAndromeda = index === 0;
    const isWarm = isAndromeda || random() < 0.7;

    if (isAndromeda) {
      // Resolved companion: a warm core inside a small inclined disk of
      // softer, subtly bluer sprites - the M31 look - kept dim enough to
      // reward a closer look without pulling the eye from the galaxy
      deepSky.add(
        Math.hypot(center[0], center[1]),
        1,
        Math.atan2(center[1], center[0]),
        0,
        0,
        center[2],
        0.11 + random() * 0.03,
        random() * TAU,
        250,
        232,
        204,
        10 + random() * 4
      );

      for (let sprite = 0; sprite < 8; sprite += 1) {
        const angle = ((sprite + random() * 0.3) / 8) * TAU;
        const major = Math.cos(angle) * (0.17 + random() * 0.04);
        const minor = Math.sin(angle) * (0.065 + random() * 0.02);
        const x = center[0] + major * Math.cos(tilt) - minor * Math.sin(tilt);
        const y = center[1] + major * Math.sin(tilt) + minor * Math.cos(tilt);

        deepSky.add(
          Math.hypot(x, y),
          1,
          Math.atan2(y, x),
          0,
          0,
          center[2] + major * alongZ,
          0.065 + random() * 0.04,
          random() * TAU,
          226,
          224,
          238,
          3 + random() * 3
        );
      }

      // M32 and M110, Andromeda's pair of compact elliptical companions,
      // huddle just off its disk as two small round smudges
      for (let companion = 0; companion < 2; companion += 1) {
        const companionAngle = random() * TAU;
        const offset = 0.12 + companion * 0.09 + random() * 0.03;
        const x = center[0] + offset * Math.cos(companionAngle);
        const y = center[1] + offset * Math.sin(companionAngle);

        deepSky.add(
          Math.hypot(x, y),
          1,
          Math.atan2(y, x),
          0,
          0,
          center[2] + offset * (random() - 0.5),
          0.028 + random() * 0.018,
          random() * TAU,
          240,
          228,
          210,
          3.5 + random() * 2
        );
      }
    } else {
      // Anonymous background galaxies: one or two overlapping soft sprites
      // each, reading as compact smudges rather than lines of dots
      const sprites = 1 + Math.trunc(random() * 2);

      for (let sprite = 0; sprite < sprites; sprite += 1) {
        const offset = sprite * (0.04 + random() * 0.03);
        const x = center[0] + offset * Math.cos(tilt);
        const y = center[1] + offset * Math.sin(tilt);

        deepSky.add(
          Math.hypot(x, y),
          1,
          Math.atan2(y, x),
          0,
          0,
          center[2] + offset * alongZ,
          0.05 + random() * 0.06,
          random() * TAU,
          isWarm ? 245 : 205,
          isWarm ? 228 : 215,
          isWarm ? 205 : 240,
          3 + random() * 4
        );
      }
    }
  }

  // Galaxies cluster: one compact huddle of smudges in the far field (a
  // Fornax-cluster analog) instead of every neighbor drifting alone
  const groupAzimuth = random() * TAU;
  const groupCosPolar = (0.3 + random() * 0.6) * (random() < 0.5 ? -1 : 1);
  const groupSinPolar = Math.sqrt(1 - groupCosPolar * groupCosPolar);
  const groupDistance = 7.5 + random() * 1.5;

  for (let index = 0; index < 5; index += 1) {
    const x =
      groupDistance * groupSinPolar * Math.cos(groupAzimuth) +
      spread(random, 0.3);
    const y =
      groupDistance * groupSinPolar * Math.sin(groupAzimuth) +
      spread(random, 0.3);
    // Cluster cores are ruled by red ellipticals, spirals keep out
    const isElliptical = random() < 0.75;

    deepSky.add(
      Math.hypot(x, y),
      1,
      Math.atan2(y, x),
      0,
      0,
      groupDistance * groupCosPolar + spread(random, 0.3),
      0.04 + random() * 0.05,
      random() * TAU,
      isElliptical ? 243 : 210,
      isElliptical ? 226 : 216,
      isElliptical ? 206 : 238,
      2.5 + random() * 2
    );
  }

  // Classical dwarf spheroidal satellites (Sculptor and Fornax analogs):
  // diffuse whispers of old stars far off the plane, so tenuous they went
  // unnoticed until the 20th century despite orbiting our own galaxy
  for (let index = 0; index < 3; index += 1) {
    const azimuth = random() * TAU;
    const cosPolar = (0.35 + random() * 0.6) * (random() < 0.5 ? -1 : 1);
    const sinPolar = Math.sqrt(1 - cosPolar * cosPolar);
    const radius = 1.6 + random() * 0.5;

    deepSky.add(
      radius * sinPolar,
      1,
      azimuth,
      0,
      0,
      radius * cosPolar,
      0.045 + random() * 0.03,
      random() * TAU,
      228,
      218,
      205,
      2 + random() * 1.5
    );
  }

  return [
    farStars.build({
      alpha: 1,
      falloffK: 4.5,
      maxPointSize: 3.5,
      novaAmp: 0,
      patternMul: 0,
      sizeMul: 1,
      spikeAmp: 0,
      target: "background",
      twinkleAmp: 0.22,
    }),
    globulars.build({
      alpha: 0.8,
      falloffK: 3,
      maxPointSize: 5,
      novaAmp: 0,
      patternMul: 0,
      sizeMul: 1,
      spikeAmp: 0,
      target: "background",
      twinkleAmp: 0,
    }),
    deepSky.build({
      alpha: 1,
      falloffK: 3,
      maxPointSize: 44,
      novaAmp: 0,
      patternMul: 0,
      sizeMul: 1,
      spikeAmp: 0,
      target: "background",
      twinkleAmp: 0,
    }),
    diskGlow.build({
      alpha: 1,
      falloffK: 3,
      maxPointSize: 110,
      novaAmp: 0,
      patternMul: 1,
      sizeMul: 0.82,
      spikeAmp: 0,
      target: "glow",
      twinkleAmp: 0,
    }),
    bulgeGlow.build({
      alpha: 1,
      falloffK: 3,
      maxPointSize: 190,
      novaAmp: 0,
      patternMul: 1,
      sizeMul: 0.82,
      spikeAmp: 0,
      target: "glow",
      twinkleAmp: 0,
    }),
    oldStars.build({
      alpha: 1,
      falloffK: 4.5,
      maxPointSize: 16,
      novaAmp: 0,
      patternMul: 1,
      sizeMul: 1,
      spikeAmp: 0.3,
      target: "stars",
      twinkleAmp: 0.1,
    }),
    dust.build({
      alpha: 1,
      falloffK: 3,
      maxPointSize: 84,
      novaAmp: 0,
      patternMul: 1,
      sizeMul: 0.82,
      spikeAmp: 0,
      target: "dust",
      twinkleAmp: 0,
    }),
    youngStars.build({
      alpha: 1,
      falloffK: 4.5,
      maxPointSize: 14,
      novaAmp: 1,
      patternMul: 1,
      sizeMul: 1,
      spikeAmp: 0.3,
      target: "foreground",
      twinkleAmp: 0.12,
    }),
    h2Regions.build({
      alpha: 1,
      falloffK: 3,
      maxPointSize: 48,
      novaAmp: 0,
      patternMul: 1,
      sizeMul: 0.82,
      spikeAmp: 0,
      target: "foreground",
      twinkleAmp: 0,
    }),
    nearStars.build({
      alpha: 0.6,
      falloffK: 4.5,
      maxPointSize: 9,
      novaAmp: 0,
      patternMul: 0,
      sizeMul: 1,
      spikeAmp: 0,
      target: "foreground",
      twinkleAmp: 0.2,
    }),
  ];
};
