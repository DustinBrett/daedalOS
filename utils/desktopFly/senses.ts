// Sensory transduction: what the desktop looks like to a fly's eyes.
//
// Everything downstream of these functions is the real connectome; everything
// here is a modelling choice about what a cursor, a dragged window, or a
// neighbour's takeoff *is* to a fly. The looming maths follows gnat's
// `terrain.rs` (`loom_drive`) and `app.rs` (`compute_loom`) (MIT); the eye
// model adds the ~90° rear blind zone of the real animal, whose two eyes
// cover about 270° combined (NeuroMechFly 2.0, Wang-Chen et al. 2023).
//
// All positions are scene coordinates (origin centre, +y up).

import { type Point } from "utils/desktopFly/fly";

/** Per-eye looming drive plus the wind (air-puff) channel, all 0..1. */
export type Threat = {
  loomL: number;
  loomR: number;
  puff: number;
};

/** A window rectangle in scene coordinates, with its drag velocity. */
export type MovingRect = {
  /** Ledge/window identity, so a fly ignores the window it stands on. */
  id: number;
  vx: number;
  vy: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(Math.max(value, lo), hi);

/**
 * How far behind the fly a stimulus sits, 0 (in front or beside) to 1
 * (directly behind). The combined visual field spans about 270°, leaving a
 * ~90° blind cone to the rear — which is why sneaking up on a real fly from
 * behind works.
 */
const rearBlindness = (cosBearing: number): number =>
  // cos < cos(135°) ≈ -0.7071 means inside the rear 90° cone.
  clamp((-cosBearing - 0.7071) / (1 - 0.7071), 0, 1);

/**
 * Split a looming drive between the eyes by bearing relative to the heading.
 * `rdX/rdY` is the unit vector from the fly to the stimulus.
 */
const eyeSplit = (
  heading: number,
  rdX: number,
  rdY: number
): [number, number] => {
  const sin = Math.sin(heading);
  const cos = Math.cos(heading);
  // Positive: stimulus on the fly's left.
  const crossZ = cos * rdY - sin * rdX;
  const cosBearing = cos * rdX + sin * rdY;
  // Deep binocular overlap in front and to the sides, fading to nearly
  // nothing in the rear blind cone.
  const blind = 1 - 0.94 * rearBlindness(cosBearing);
  const lw = clamp(0.5 + 0.5 * crossZ, 0.12, 1) * blind;
  const rw = clamp(0.5 - 0.5 * crossZ, 0.12, 1) * blind;

  return [lw, rw];
};

/**
 * Cursor kinematics into looming drive for each eye, plus an air puff.
 * gnat's `compute_loom`, applied per fly rather than to one anointed fly.
 */
export const cursorThreat = (
  pos: Point,
  heading: number,
  mouse: Point,
  mouseVel: Point
): Threat => {
  const relX = mouse.x - pos.x;
  const relY = mouse.y - pos.y;
  const dist = Math.max(Math.hypot(relX, relY), 20);
  // Radial approach speed; positive means the cursor is closing in.
  const approach = -(relX * mouseVel.x + relY * mouseVel.y) / dist;
  // approach/dist is the inverse time-to-contact — loom urgency. The gain
  // sets where the response saturates: at the old x6 anything with SIX
  // SECONDS to spare read as a maximal loom, so slow and fast approaches
  // were indistinguishable — an awake fly bolted from a lazy sweep 300 px
  // away 7 times in 8, a 40 px/s creep launched it (when slow approach is
  // exactly how a real fly lets you get close: escape falls off hard for
  // slow expansion), and no sleep gate could pass a lunge while blocking a
  // drift. At x1.2 the response is full only inside ~0.8 s to contact.
  //
  // And looming is EXPANSION, not motion: an object gliding to a stop a
  // few centimetres to the side is translating across the eye, which the
  // real LC4/LPLC2 populations do not answer with escape. The impact
  // parameter — how far this trajectory would miss by — separates the two:
  // radial approach toward a point NEAR the fly is not approach AT the fly.
  const speed2 = Math.hypot(mouseVel.x, mouseVel.y);
  const miss =
    speed2 > 1
      ? Math.abs(relX * mouseVel.y - relY * mouseVel.x) / speed2
      : dist;
  const onCourse = clamp(1 - miss / 110, 0, 1);
  let loom =
    clamp((approach / dist) * 1.2, 0, 1) *
    onCourse *
    clamp(1 - dist / 800, 0, 1);

  // Hovering close counts too: a big stationary object is still a threat —
  // and one parked almost on top of the fly fills its whole visual field.
  loom += clamp((130 - dist) / 130, 0, 1) * 0.5;
  loom += clamp((50 - dist) / 50, 0, 1) * 0.4;
  loom = clamp(loom, 0, 1);

  const [lw, rw] = eyeSplit(heading, relX / dist, relY / dist);
  const speed = Math.hypot(mouseVel.x, mouseVel.y);
  const puff = clamp(speed / 1500, 0, 1) * clamp(1 - dist / 500, 0, 1);

  return { loomL: loom * lw, loomR: loom * rw, puff };
};

/** Radius inside which a dragged window is a visible threat, in px. */
const RECT_THREAT_RADIUS = 460;
/** Expansion rate (1/s) at which the loom response is ~2/3 of maximum. */
const EXPANSION_SCALE = 5;

/**
 * A dragged window is a large object sweeping the substrate — to a fly, the
 * classic looming stimulus. Drive rises with the closing speed of the
 * window's nearest edge and with proximity, exactly like gnat's `loom_drive`;
 * a stationary window never looms, no matter how close.
 */
export const rectThreat = (
  pos: Point,
  heading: number,
  rect: MovingRect
): Threat => {
  const none = { loomL: 0, loomR: 0, puff: 0 };
  const speed = Math.hypot(rect.vx, rect.vy);

  if (speed < 30) return none;

  // Nearest point of the rectangle to the fly.
  const nx = clamp(pos.x, rect.x0, rect.x1);
  const ny = clamp(pos.y, rect.y0, rect.y1);
  const relX = nx - pos.x;
  const relY = ny - pos.y;
  const dist = Math.max(Math.hypot(relX, relY), 10);

  if (dist > RECT_THREAT_RADIUS) return none;

  // Closing speed: the component of the window's velocity toward the fly.
  const closing = -(rect.vx * relX + rect.vy * relY) / dist;

  if (closing <= 0) return none;

  // Angular expansion, soft-saturated (gnat's loom_drive), with proximity.
  const expansion = closing / dist;
  const urgency = 1 - Math.exp(-expansion / EXPANSION_SCALE);
  const proximity = 1 - dist / RECT_THREAT_RADIUS;
  const loom = clamp(urgency * proximity * 1.6, 0, 1);

  // A fly right at the rectangle edge sees it everywhere; default frontal.
  const [lw, rw] =
    dist > 12 ? eyeSplit(heading, relX / dist, relY / dist) : [0.65, 0.65];

  return {
    loomL: loom * lw,
    loomR: loom * rw,
    // A big surface sweeping past also pushes air.
    puff: clamp(speed / 2000, 0, 0.6) * clamp(1 - dist / 300, 0, 1),
  };
};

/**
 * A small moving thing — another fly, a sheep, the cursor at a distance —
 * as seen by the LC11 small-object pathway: per-eye drive rising with the
 * object's speed, strongest at mid range, gone outside `[dist0, dist1]`.
 */
export const smallObjectDrive = (
  pos: Point,
  heading: number,
  at: Point,
  speed: number,
  dist0: number,
  dist1: number
): [number, number] => {
  const relX = at.x - pos.x;
  const relY = at.y - pos.y;
  const dist = Math.hypot(relX, relY);

  if (dist < dist0 || dist > dist1 || speed < 15) return [0, 0];

  // LC11 prefers modest speeds (Keleş & Frye 2017): the response saturates
  // by a brisk conspecific walk, rather than only for the fastest darts.
  const strength =
    clamp(speed / 150, 0, 1) *
    clamp(1 - (dist - dist0) / (dist1 - dist0), 0.2, 1);
  const [lw, rw] = eyeSplit(heading, relX / dist, relY / dist);

  return [strength * lw, strength * rw];
};

/** Radius inside which a click reads as a swat, in px. */
const TAP_RADIUS = 260;
/**
 * Radius inside which a click *is* the fly being poked. Physical contact is
 * mechanosensory, not visual — it reaches the giant fibre through the
 * tactile/Johnston's-organ pathway and reliably triggers escape.
 */
const CONTACT_RADIUS = 32;

export const isContact = (pos: Point, click: Point): boolean =>
  Math.hypot(click.x - pos.x, click.y - pos.y) < CONTACT_RADIUS;

/**
 * A click near a fly is a tap on the substrate right next to it — a swat.
 * Strong up close, gone beyond TAP_RADIUS. Returns the *pulse* magnitude;
 * the caller applies its own decay.
 */
export const tapThreat = (
  pos: Point,
  heading: number,
  click: Point
): Threat => {
  const relX = click.x - pos.x;
  const relY = click.y - pos.y;
  const dist = Math.max(Math.hypot(relX, relY), 15);

  if (dist > TAP_RADIUS) return { loomL: 0, loomR: 0, puff: 0 };

  const strength = clamp(1 - dist / TAP_RADIUS, 0, 1);
  const [lw, rw] = eyeSplit(heading, relX / dist, relY / dist);
  // A tap is felt through the substrate as much as seen.
  const loom = 0.9 * strength;

  return {
    loomL: loom * lw,
    loomR: loom * rw,
    puff: 0.8 * strength,
  };
};

/** Radius inside which a neighbour's takeoff is seen, in px. */
const STARTLE_RADIUS = 260;

/**
 * Escape contagion: a neighbour bursting into flight is sudden motion in the
 * visual field, and flies socially modulate their defensive behaviour on
 * exactly that cue. A modest pulse — one takeoff makes neighbours nervous,
 * several close together tip them into escaping too.
 */
export const takeoffStartle = (
  pos: Point,
  heading: number,
  takeoffAt: Point
): Threat => {
  const relX = takeoffAt.x - pos.x;
  const relY = takeoffAt.y - pos.y;
  const dist = Math.max(Math.hypot(relX, relY), 15);

  if (dist > STARTLE_RADIUS || dist < 1) {
    return { loomL: 0, loomR: 0, puff: 0 };
  }

  const strength = 0.45 * clamp(1 - dist / STARTLE_RADIUS, 0, 1);
  const [lw, rw] = eyeSplit(heading, relX / dist, relY / dist);

  return {
    loomL: strength * lw,
    loomR: strength * rw,
    puff: 0.25 * strength,
  };
};

/** Radius inside which a suddenly-appearing object is startling, in px. */
const APPEAR_RADIUS = 520;

/**
 * A window or menu popping into existence is an object appearing from
 * nowhere — the nearer, the more alarming. Localised replacement for
 * upstream's both-eyes global window startle, now that the DOM tells us
 * where the object actually is.
 */
export const appearanceThreat = (
  pos: Point,
  heading: number,
  at: Point,
  strength = 0.55
): Threat => {
  const relX = at.x - pos.x;
  const relY = at.y - pos.y;
  const dist = Math.max(Math.hypot(relX, relY), 15);

  if (dist > APPEAR_RADIUS) return { loomL: 0, loomR: 0, puff: 0 };

  const falloff = clamp(1 - dist / APPEAR_RADIUS, 0, 1);
  const [lw, rw] = eyeSplit(heading, relX / dist, relY / dist);
  const loom = strength * (0.35 + 0.65 * falloff);

  return {
    loomL: loom * lw,
    loomR: loom * rw,
    puff: 0.3 * strength * falloff,
  };
};

/** Accumulate one threat into another, saturating at 1. */
export const addThreat = (into: Threat, threat: Threat): void => {
  /* eslint-disable no-param-reassign */
  into.loomL = clamp(into.loomL + threat.loomL, 0, 1);
  into.loomR = clamp(into.loomR + threat.loomR, 0, 1);
  into.puff = clamp(into.puff + threat.puff, 0, 1);
  /* eslint-enable no-param-reassign */
};

/** Total salience of a threat, for memory and dopamine gating. */
export const threatLevel = ({ loomL, loomR, puff }: Threat): number =>
  Math.max(loomL, loomR) + 0.3 * puff;
