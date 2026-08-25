export type GalaxyConfig = {
  faceOn: boolean;
  speed: number;
};

export const defaultConfig: GalaxyConfig = {
  faceOn: false,
  speed: 1,
};

/**
 * Density wave model settings (all distances are in galaxy radii, where the
 * visible stellar disk ends near 1.0).
 *
 * Spiral arms emerge from nested elliptical orbits whose major axes are
 * rotated progressively with radius (`armWinding`). Aligned inner ellipses
 * produce the central bar, the crowding of ellipse apoapsides produces the
 * two major arms.
 */
export const GALAXY = {
  armWinding: 3.5,
  barAxisRatio: 0.62,
  barRadius: 0.24,
  bulgeRadius: 0.13,
  diskAxisRatio: 0.94,
  diskScaleLength: 0.38,
  dustLaneOffset: -0.35,
  // Absolute sampling bound; the visible edge is set by the break, not here
  maxRadius: 1.25,
  // Negative: the disk rotates clockwise on screen, so the arms (whose
  // azimuth increases with radius) trail the rotation like real spirals.
  // The ratio places corotation at ~0.71 R, inside the disk: stars overtake
  // the spiral pattern inside that radius and fall behind it outside,
  // the hallmark of density wave dynamics.
  orbitalSpeed: -0.02,
  // Type II down-bending profile (van der Kruit truncation): beyond the
  // break radius the stellar density falls along a much steeper exponential
  // instead of ending at a hard edge - discs dissolve, they don't stop
  outerBreak: 0.92,
  outerScale: 0.09,
  patternSpeed: -0.028,
  // The outer disk is warped into a gentle integral-sign shape (mapped in
  // HI gas for decades and traced in stellar kinematics by Gaia DR2): one
  // side of the rim lifts above the plane while the opposite side dips,
  // growing from warpStart out to the disk edge
  warpAmplitude: 0.055,
  warpStart: 0.6,
};

export const CAMERA = {
  azimuthDriftSpeed: 0.006,
  distance: 2.07,
  elevation: 0.48,
  elevationFaceOn: 1.35,
  elevationJitter: 0.05,
  farPlane: 30,
  fieldOfView: 50,
  mobileDistanceMul: 1.2,
  // Portrait screens show more of the disc from a higher vantage
  mobileElevationAdd: 0.22,
  nearPlane: 0.05,
  parallaxAzimuth: 0.14,
  parallaxElevation: 0.09,
  // Screen-space pan paired with the parallax orbit: the whole frame glides
  // the way the camera swings, so a tilt reads as one coherent motion
  // instead of a rotation about a pinned center
  parallaxPan: 0.055,
  screenShiftY: 0.1,
  // Tilt tracking speed (per second): fast enough to feel attached to the
  // hand, slow enough that the glide stays calm rather than twitchy
  smoothing: 4.5,
};

export const BASE_COUNTS = {
  bulgeGlow: 2600,
  diskGlow: 18000,
  dust: 13000,
  farStars: 2800,
  globularClusters: 110,
  h2Regions: 150,
  haloStars: 1500,
  nearStars: 90,
  oldStars: 46000,
  openClusters: 26,
  youngStars: 7000,
};
