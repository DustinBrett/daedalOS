/* eslint-disable no-param-reassign */
// The fly's body and behaviour: position, scale, height, leg angles, wing
// angles, driven by the connectome's population rates — every fly carries
// its own full brain. Ported from gnat's `fly.rs` / DesktopFly's
// `FlyModel.swift` (MIT).
//
// Coordinates are the original's scene frame: origin at the centre of the
// output, +y up. Converting to screen space is the renderer's job.

import { FlyMemory } from "utils/desktopFly/memory";
import { Rng } from "utils/desktopFly/rng";
import { type Signals } from "utils/desktopFly/signals";

/**
 * Rendered size of the fly at ground level. D. melanogaster is ~3mm — half
 * a housefly — so it should read as a small speck with detail on approach,
 * while staying big enough to see and to catch.
 */
const FLY_SCALE = 0.92;
/** How far from the edge of the output a flight target may land. */
const EDGE_MARGIN = 50;
/**
 * Spontaneous takeoff rate at full arousal, per second, before the
 * rover/sitter split. Measured against the closed loop so an undisturbed
 * fly leaves the ground about once a minute rather than constantly.
 */
const SPONTANEOUS_FLIGHT_PER_S = 0.2;
/** How sharply that rate climbs with arousal. */
const AROUSAL_FLIGHT_EXPONENT = 4;
/**
 * Shortest grooming bout, seconds. Real bouts run for seconds and work
 * front to back; without a floor here the command neuron's rate crosses
 * the stop threshold almost immediately and grooming chatters on and off
 * in half-second flickers.
 */
/**
 * Per-bout minimum groom length, drawn at each bout's start. A fixed 2.5 s
 * floor plus a fast-fluctuating exit drive meant every bout ended moments
 * after the floor lifted: 2.5-3.3 s with sd 0.18, the zero-variance tell.
 * Real grooming runs seconds to tens of seconds and no two washes match.
 */
const GROOM_BOUT_MIN = 2.5;
const GROOM_BOUT_MAX = 9;
/** Seconds to discharge a full sleep pressure, before individual variation. */
/**
 * Seconds of sleep to discharge the full pressure range. Sized against the
 * field's own definition rather than by eye: an episode only counts as sleep
 * in Drosophila if it runs five minutes or more, so anything shorter is a
 * rest, not a nap, however sleepy the fly looks. At 320 this produced 1.6 min
 * bouts — longer than the 23 s it started at, still under the criterion.
 */
const SLEEP_DISCHARGE_S = 700;
/**
 * Seconds to charge that range awake. Raised alongside the discharge, because
 * bout length and the *fraction* of the day spent asleep are set by the ratio
 * of the two: lengthening naps on their own would have taken a fly from 28%
 * asleep to 42% without anything asking for more sleep, only for longer.
 */
const SLEEP_CHARGE_S = 1850;
/**
 * Per-bout spread on how deep a sleep this one turns out to be. Without it a
 * given fly's naps were identical to the second — 6.80 min, every time, for
 * its whole life — because discharge is deterministic once vigor is fixed.
 * Individual variation between flies is not the same thing as variation
 * within a fly, and only the second is what makes a nap look unplanned.
 */
const SLEEP_BOUT_MIN = 0.95;
const SLEEP_BOUT_MAX = 1.9;
/**
 * Locomotion, in px. There are two scales here and they disagree, which is
 * the trap:
 *
 *  - The *body* scale. The fly renders ~19 px long and a female
 *    D. melanogaster is ~2.5 mm, so 7.6 px per mm.
 *  - The *scene* scale. A viewer reads the desktop as a desk — call it
 *    530 mm across 1920 px, so 3.6 px per mm.
 *
 * The fly is deliberately drawn about 2.1x life size, because a true-scale
 * fruit fly would be nine pixels long and neither visible nor catchable.
 * That means motion has to be calibrated in *scene* units, not body units:
 * a fly moving at a correct body-relative speed crosses the desk at twice
 * the pace a real one would, and reads as a fly on fast-forward. Getting
 * this backwards is exactly what happened once already.
 *
 * So: Giraldo et al. 2019 (Fig 2A) put adult walking near 5-8 mm/s at room
 * temperature with bursts past 12, and at the scene scale that is roughly
 * 18-29 px/s, bursting to 45.
 */
const SCENE_PX_PER_MM = 3.6;
/** Walking: a resting pace plus whatever DNp09 is asking for, in mm/s. */
const WALK_BASE_MM_S = 4.2;
const WALK_DRIVE_MM_S = 14;
const WALK_BASE_PX_S = WALK_BASE_MM_S * SCENE_PX_PER_MM;
const WALK_DRIVE_PX_S = WALK_DRIVE_MM_S * SCENE_PX_PER_MM;
/** Full gait drive to the brain at a sprint, ~18 mm/s. */
const WALK_SATURATION = 18 * SCENE_PX_PER_MM;
/** Backward walking runs about half the forward pace. */
const BACKWARD_PX_S = -0.5 * WALK_BASE_MM_S * SCENE_PX_PER_MM;
/**
 * Flight speed, px/s. Free-flying Drosophila cruise at 20-60 cm/s, which at
 * the scene scale is 720-2160 px/s — a hop across the desktop is still a
 * dart, just not a teleport.
 */
/**
 * A casual hop is not cruising flight. The 20-60 cm/s figure in the
 * literature is a fly crossing open space; a fly lifting off a surface,
 * flying a few centimetres and landing again spends most of that in takeoff
 * and touchdown and averages far less. Escapes are the fast case, and they
 * are meant to look it.
 */
const FLIGHT_PX_S = 12 * 10 * SCENE_PX_PER_MM;
const ESCAPE_PX_S = 35 * 10 * SCENE_PX_PER_MM;
/**
 * How far a hop carries, px. Flies on a surface mostly move a few
 * centimetres at a time; targeting uniformly across the whole desktop gave a
 * median hop of 31% of the screen width, which reads as a streak however
 * correct the speed is. Squaring the draw biases it toward the short end,
 * so a long flight is the exception it should be.
 */
const HOP_MIN_PX = 80;
const HOP_MAX_PX = 430;
const ESCAPE_MIN_PX = 240;
const ESCAPE_MAX_PX = 700;
/**
 * A perch has to be worth crossing to, but a fly picking the one ledge on
 * the far side of the desk turns a hop into a commute — and a commute at hop
 * speed is a long, fast streak across the screen.
 */
const LEDGE_MIN_PX = 120;
const LEDGE_MAX_PX = 520;
/** No flight is instant; a hop of a few millimetres still takes a moment. */
const MIN_FLIGHT_S = 0.3;
const MIN_ESCAPE_S = 0.2;
/**
 * Stride length per unit leg amplitude, px.
 *
 * Note this is *not* halved along with the speeds. Step frequency is a
 * property of the animal, not of the scene: a real fly walking at 7 mm/s
 * turns its legs over at about 10 Hz whatever the drawing scale. So stride
 * length lives in scene units (~0.65 mm, about 2.3 px) and the gait keeps
 * its real cadence while the fly covers less ground.
 */
const STRIDE_SCALE = 4.8;
const MIN_STRIDE_PX = 1.8;
/** For reference: STRIDE_SCALE yields strides near 0.65 mm at a normal pace. */
/** A flying fly, for the small-object pathway. Roughly FLIGHT_PX_S. */
export const FLIGHT_SPEED_PX_S = FLIGHT_PX_S;
/**
 * How long a fly leaves it before grooming again, seconds. A fly that has
 * just cleaned itself does not immediately start over — without this the
 * command neuron's baseline noise restarts a bout within seconds and the
 * animal grooms half its life away, where a real one spends 5-15%.
 */
const GROOM_COOLDOWN_MIN = 12;
const GROOM_COOLDOWN_MAX = 40;
/**
 * Lateral wander during flight, in scene units, for an undamaged fly. Small
 * enough to read as a straight line at this size; it exists only so the
 * path is not mathematically perfect.
 */
const WOBBLE_BASE = 0.5;
/** How much a fully torn wing multiplies that. Asymmetric lift is real. */
const WOBBLE_PER_WEAR = 14;

const { PI } = Math;
const TWO_PI = PI * 2;

const angleDiff = (from: number, to: number): number => {
  let d = (to - from) % TWO_PI;

  if (d > PI) d -= TWO_PI;
  if (d < -PI) d += TWO_PI;

  return d;
};

const smoothstep = (t: number): number => {
  const x = Math.min(Math.max(t, 0), 1);

  return x * x * (3 - 2 * x);
};

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(Math.max(value, lo), hi);

export type Point = { x: number; y: number };

/** A walkable surface in scene coordinates: a window rim, an icon, a menu. */
export type Ledge = {
  /** Stable identity of the window this edge belongs to. */
  id: number;
  x0: number;
  x1: number;
  y: number;
  /** How far this surface stands above the wallpaper, in scene units. */
  z: number;
};

export const FlyState = {
  /** Pinned under the user's held-down pointer, struggling to get free. */
  Caught: 5,
  Flying: 3,
  Grooming: 2,
  Idle: 1,
  Sleeping: 4,
  Walking: 0,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlyState = (typeof FlyState)[keyof typeof FlyState];

/**
 * One fly's individuality, fixed at "eclosion" from its seed. Every field is
 * a variation real D. melanogaster actually show: sexual dimorphism in size
 * and abdominal pattern, nutrition-dependent body size, temperature-dependent
 * melanisation, the rover/sitter foraging polymorphism (the natural `for`
 * gene variants, ~70% rover in wild populations), idiosyncratic locomotor
 * handedness (Buchanan et al. 2015), boldness, overall vigor, and a
 * circadian chronotype (morning vs evening flies).
 */
type Phenotype = {
  /** How readily this fly orients to distant motion, 0.25..1. */
  attentiveness: number;
  /** Abdominal melanisation, scales band/tip darkness, 0.85..1.2. */
  bandStrength: number;
  /** >1 is braver: weaker perceived looms, higher flee threshold. */
  boldness: number;
  /** Hours the circadian curve is shifted for this fly, ±1.5. */
  chronotype: number;
  /** Persistent individual turning bias while walking, rad/s. */
  handedness: number;
  /** How strongly light gradients steer this fly, 0.25..1. */
  photoPref: number;
  /** Rovers range far and fly often; sitters stay local and idle more. */
  rover: boolean;
  sex: "female" | "male";
  /** Body size multiplier; females run larger. */
  size: number;
  /** How strongly this fly is drawn toward nearby company, 0.3..1.2. */
  sociability: number;
  /** Overall cuticle tone multiplier, lighter or darker, 0.92..1.08. */
  tone: number;
  /** Baseline activity multiplier, 0.85..1.15. */
  vigor: number;
  /** Wing length multiplier, 0.95..1.06. */
  wingLen: number;
};

const makePhenotype = (rng: Rng): Phenotype => {
  const sex = rng.float() < 0.5 ? "female" : "male";

  return {
    attentiveness: rng.range(0.25, 1),
    bandStrength: rng.range(0.85, 1.2),
    boldness: rng.range(0.75, 1.3),
    chronotype: rng.range(-1.5, 1.5),
    handedness: rng.range(-0.12, 0.12),
    photoPref: rng.range(0.25, 1),
    rover: rng.float() < 0.7,
    sex,
    size: sex === "female" ? rng.range(0.98, 1.14) : rng.range(0.86, 1),
    sociability: rng.range(0.3, 1.2),
    tone: rng.range(0.92, 1.08),
    vigor: rng.range(0.85, 1.15),
    wingLen: rng.range(0.95, 1.06),
  };
};

/** One leg's animation state. Six of them, tripod-phased. */
type Leg = {
  angle: number;
  baseYaw: number;
  isFront: boolean;
  lift: number;
  /** Offset into the gait cycle, 0..1. */
  phase: number;
  /** +1 right, -1 left. Mirrors the swing direction. */
  swingSign: number;
};

/** Attachment yaw offset, gait phase, and whether it is a foreleg. */
const LEG_SPECS: [number, number, number, boolean][] = [
  [1, 0.95, 0, true],
  [-1, 0.95, 0.5, true],
  [1, -0.1, 0.5, false],
  [-1, -0.1, 0, false],
  [1, -0.95, 0, false],
  [-1, -0.95, 0.5, false],
];

/** Euler angles of one wing. */
type Wing = {
  x: number;
  y: number;
  z: number;
};

export class Fly {
  public pos: Point;

  public heading: number;

  public speed = 30;

  public state: FlyState = FlyState.Walking;

  /**
   * Minimum time to stay in the current state, seconds. This existed and was
   * written in five places and read in none, so nothing held a state: the
   * fly flickered between standing and walking about 1.4 times a second,
   * with a third of its idle "bouts" lasting under 0.3 s and some a single
   * frame. Threat still overrides it — escape, darting and freezing are
   * supposed to interrupt.
   */
  public stateTimer: number;

  public gaitPhase: number;

  public time: number;

  public scareCooldown = 0;

  public dartCooldown = 0;

  public backwardTimer = 0;

  public dartTimer = 0;

  public stateAge = 0;

  /** Walkable window edges, refreshed by the coordinator. */
  public terrain: Ledge[] = [];

  /** The edge currently underfoot. */
  public ledge?: Ledge;

  /** The surface this flight is aimed at, so it lands *on* it. */
  public landingLedge?: Ledge;

  public flightFrom: Point = { x: 0, y: 0 };

  public flightTo: Point = { x: 0, y: 0 };

  public flightT = 0;

  public flightDur = 1;

  /** Set at takeoff: 1.0 for escape, lower for a casual hop. */
  public flightEffort = 0.6;

  /** Live effort: the base, plus ongoing escape-DN and arousal drive. */
  public effortCurrent = 0.6;

  /** 0 on the ground, 1 at maximum altitude. */
  public alt = 0;

  public pitch = 0;

  public flapPhase = 0;

  /** Grounded threat posture, 0..1. */
  public wingRaise = 0;

  /** Render scale. Higher altitude reads as closer to the viewer. */
  public scale = FLY_SCALE;

  /** This individual's ground-level scale: FLY_SCALE times its size. */
  public baseScale = FLY_SCALE;

  /** Who this fly is: fixed appearance and temperament variation. */
  public readonly phenotype: Phenotype;

  /** Motionless threat response; a frozen fly does not move at all. */
  public freezeTimer = 0;

  public freezeCooldown = 0;

  /** Time before this fly will start another grooming bout. */
  public groomCooldown = 0;

  /**
   * Pending post-handling wash. The signature response of a real fly after
   * being seized and escaping is a bout of intense grooming once it feels
   * safe again; without this the viewer saw pacing after the marquee
   * interaction and never the frantic wash. Armed on landing while
   * agitated; counts down only while the fly is calm.
   */
  private washTimer = 0;

  /**
   * Sleep inertia, 0..1: how deep asleep this fly was when it was seized.
   * A fly grabbed mid-nap fights the grip groggily for a while.
   */
  public grogginess = 0;

  /** Proboscis extension: tasting the substrate while idle. */
  public tasteTimer = 0;

  public tasteCooldown = 0;

  /** Sleep homeostat, 0..1: builds while active, discharges while asleep. */
  public sleepPressure: number;

  /** Hysteretic "needs a nap" gate driven by sleepPressure. */
  public drowsy = false;

  /** This bout's groom length floor; redrawn each time a groom begins. */
  private groomBout = GROOM_BOUT_MIN;

  /** How deep the current nap is; redrawn at each onset. */
  private sleepBout = 1;

  /** Permanent wear per wing (left, right), 0..1: torn trailing edges. */
  public wingDamage: [number, number] = [0, 0];

  /** Loser effect: a beaten male stays submissive while this runs. */
  public subordinateTimer = 0;

  /**
   * Post-contest threat display: a winner holds its wings raised over the
   * routed loser for a second or two. Without it the raise decayed with
   * the 0.3 s lunge and the win was over before anyone saw the posture.
   */
  public displayTimer = 0;

  /** Winner/loser history: shifts the odds of future contests. */
  public dominance = 0;

  /** Orienting toward distant motion: how long the gaze holds. */
  public attendTimer = 0;

  public attendCooldown = 0;

  /** When this fly next samples its surroundings (ms) — staggered. */
  public nextLookMs = 0;

  /** Site fidelity: the resting spot the fly treats as home. */
  public anchor?: Point;

  /** Path-integration vector since the anchor, in compass frame. */
  public homeVec: Point = { x: 0, y: 0 };

  /** Actively walking the home vector back to the anchor. */
  public homingTimer = 0;

  /** Continuous rest at one spot; long enough and it becomes the anchor. */
  private restTime = 0;

  /** Latest compass estimate from this fly's own ring attractor. */
  private compassAngle?: number;

  /** Seconds since the ring last carried a bump coherent enough to read. */
  private compassStale = 0;

  /** How far into a grooming bout the forelegs hand over to the hind legs. */
  private groomSwitch = 1.5;

  /** Position last frame, for path-integration step lengths. */
  private prevPos?: Point;

  /** Smoothed body rotation, rad/s — the compass circuit's turn input. */
  public headingRate = 0;

  /** Per-fly salt for its private KC object codes: no two flies encode
   * the same icon with the same cells. */
  public readonly mbSalt: number;

  /** The object key currently presented to the mushroom body, if any. */
  public mbFocusKey?: string;

  public mbFocusMs = 0;

  /** Smoothed MBON valence evoked by the focused object (approach - avoid
   * relative to rest); negative means the fly has learned to dislike it. */
  public mbEvoked = 0;

  /**
   * Slow average of the MBON valence this fly gets from looking at things
   * in general. `mbEvoked` is measured against this, so 0 means "like other
   * objects" rather than "like silence".
   */
  public mbBaseline = 0;

  /** Seconds this fly has spent looking at anything, ever. */
  public mbSeen = 0;

  /**
   * Slow average of the verdicts this fly reaches. "Dislikes" means worse
   * than its own usual, which is the only comparison that survives the
   * baseline drifting.
   */
  public mbVerdictMean = 0;

  /** Cooldown between dopamine pulses, so one bad moment teaches once. */
  public mbPulseCooldown = 0;

  /** Height above the surface, in scene units. */
  public z = 0;

  /**
   * How high the surface underfoot stands above the wallpaper. A fly on a
   * window rim really is above one on the desktop, and reads that way: it
   * draws a touch larger and throws its shadow further.
   */
  public surfaceZ = 0;

  /** Abdomen breathing multiplier, slower and deeper while asleep. */
  public breath = 1;

  /**
   * 0 awake to 1 settled into sleep. A sleeping fly visibly hunkers down —
   * body low, legs drawn in — and without the posture a nine-minute nap
   * looked like a sprite that had frozen. Eased, so falling asleep and
   * waking read as movements rather than switches.
   */
  public restDepth = 0;

  /** Session-lifetime working memory: places, objects, familiarity. */
  public readonly memory = new FlyMemory();

  /** Where the pointer holds this fly while it is Caught. */
  public pinnedAt?: Point;

  /** How hard a caught fly is thrashing, 0..1. */
  public struggle = 0;

  /**
   * How rattled this fly is, 0..1, decaying over about a minute. Set by
   * being handled. A fly that has been in a fist walks faster, settles
   * less, and treats the next looming shape as worse than it is.
   */
  public agitation = 0;

  /** Cooldown between fly-to-fly encounters. */
  public socialCooldown = 0;

  /** A novel object worth walking over to look at. */
  public curiosityTarget?: Point;

  public curiosityTimer = 0;

  /** Phototaxis steering (rad/s) from the wallpaper brightness gradient. */
  public lightSteer = 0;

  public legs: Leg[];

  /** Left wing then right wing. */
  public wings: Wing[];

  private liveArousal = 0;

  private liveWing = 0;

  private readonly rng: Rng;

  public constructor(at: Point, seed: number) {
    const rng = new Rng(seed);

    this.phenotype = makePhenotype(rng);
    this.baseScale = FLY_SCALE * this.phenotype.size;
    this.scale = this.baseScale;
    // Everyone starts the day part-rested, no two alike — and with its own
    // refractory offsets, so a batch spawned together never acts in unison.
    this.sleepPressure = rng.range(0.1, 0.5);
    this.attendCooldown = rng.range(0, 8);
    this.mbSalt = Math.floor(rng.float() * 1e9);
    this.legs = LEG_SPECS.map(([side, yawOff, phase, isFront]) => ({
      angle: 0,
      baseYaw: side > 0 ? yawOff : PI - yawOff,
      isFront,
      lift: 0,
      phase,
      swingSign: side,
    }));
    this.pos = { ...at };
    this.heading = rng.range(0, TWO_PI);
    this.stateTimer = rng.range(1.5, 4);
    this.gaitPhase = rng.range(0, 1);
    this.time = rng.range(0, 100);
    // Folded flat over the abdomen, the resting pose.
    this.wings = [
      { x: 0, y: 0, z: -0.13 },
      { x: 0, y: 0, z: 0.13 },
    ];
    this.rng = rng;
  }

  /** How hard the fly is walking, 0..1, fed back to the brain. */
  public walkingIntensity(): number {
    return this.state === FlyState.Walking
      ? clamp(Math.abs(this.effectiveSpeed()) / WALK_SATURATION, 0, 1)
      : 0;
  }

  private effectiveSpeed(): number {
    return this.backwardTimer > 0 ? BACKWARD_PX_S : this.speed;
  }

  public startFlight(
    bounds: Point,
    awayFrom?: Point,
    escape?: boolean,
    effort?: number
  ): void {
    // Through setState, like every other transition: assigning state
    // directly meant a takeoff out of a groom never recorded the groom
    // cooldown, so the fly could land and resume washing at once.
    this.setState(FlyState.Flying);
    if (escape) {
      // Nothing keeps a fly awake like nearly dying. A sleeper that was
      // grabbed, thrashed loose and flew off used to collapse back into
      // sleep seconds after landing, because its pressure was untouched —
      // mechanical disturbance is literally how the field keeps flies
      // awake, so an escape has to dump it.
      this.drowsy = false;
      this.sleepPressure = Math.min(this.sleepPressure, 0.35);
    }
    this.ledge = undefined;
    this.landingLedge = undefined;
    this.curiosityTarget = undefined;
    this.pinnedAt = undefined;
    this.struggle = 0;
    this.freezeTimer = 0;
    this.tasteTimer = 0;
    this.attendTimer = 0;
    this.displayTimer = 0;
    this.washTimer = 0;
    this.homingTimer = 0;
    this.flightEffort = clamp(
      effort ?? (escape ? 1 : this.rng.range(0.4, 0.75)),
      0.25,
      1
    );
    this.effortCurrent = this.flightEffort;
    this.flapPhase = 0;
    this.wingRaise = 0;
    this.flightFrom = { ...this.pos };

    const hw = bounds.x / 2 - EDGE_MARGIN;
    const hh = bounds.y / 2 - EDGE_MARGIN;
    let target: Point = { x: 0, y: 0 };
    let chosen = false;

    // A casual flight often ends on a window edge rather than open ground.
    if (
      !escape &&
      !awayFrom &&
      this.terrain.length > 0 &&
      this.rng.float() < 0.7
    ) {
      // Flies make for raised edges — a rim, a lid, the corner of a thing —
      // far more readily than for open floor. Pick a few surfaces and take
      // the highest, so a stack of windows draws it upward.
      let best: Ledge | undefined;

      let bestAt: Point | undefined;

      for (let pick = 0; pick < 5; pick += 1) {
        const ledge =
          this.terrain[this.rng.rangeInt(0, this.terrain.length - 1)];

        const inset = Math.min(25, (ledge.x1 - ledge.x0) / 3);
        const at = {
          x: clamp(
            this.pos.x + this.rng.range(-LEDGE_MAX_PX, LEDGE_MAX_PX),
            ledge.x0 + inset,
            ledge.x1 - inset
          ),
          y: ledge.y,
        };
        const reach = Math.hypot(at.x - this.pos.x, at.y - this.pos.y);

        if (
          ledge.x1 - ledge.x0 > 40 &&
          // Worth leaving the ground for, but still a hop rather than a trip
          // to the other end of the desk.
          reach >= LEDGE_MIN_PX &&
          reach <= LEDGE_MAX_PX &&
          (!best || ledge.z > best.z)
        ) {
          best = ledge;
          bestAt = at;
        }
      }
      if (best && bestAt) {
        target = bestAt;
        chosen = true;
        this.landingLedge = best;
      }
    }
    if (!chosen) {
      // Rank acceptable landing spots by remembered valence, so a fly that
      // was swatted in a corner stops landing there and favours ground where
      // it has stood undisturbed.
      let best: Point | undefined;
      let bestScore = Number.NEGATIVE_INFINITY;
      // Escaping means going the other way from whatever caused it, so aim
      // directly away rather than sampling the screen and discarding the
      // candidates that happen to point the wrong way.
      const flee = awayFrom
        ? Math.atan2(this.pos.y - awayFrom.y, this.pos.x - awayFrom.x)
        : undefined;

      // The clamp below keeps targets on screen, but clamping an outward
      // bearing can shrink the flight to almost nothing. Unguarded, a third
      // of corner hops were sub-40 px stutters, and a fly chased into a
      // corner "escaped" 28 px — a twitch, at the very moment someone was
      // watching it hardest. Candidates that collapse are discarded.
      const minReach = (escape ? ESCAPE_MIN_PX : HOP_MIN_PX) * 0.6;

      for (let attempt = 0; attempt < 16; attempt += 1) {
        const spread = this.rng.float();
        const reach = escape
          ? ESCAPE_MIN_PX + (ESCAPE_MAX_PX - ESCAPE_MIN_PX) * spread
          : HOP_MIN_PX + (HOP_MAX_PX - HOP_MIN_PX) * spread * spread;
        const bearing =
          flee === undefined
            ? this.rng.range(-PI, PI)
            : flee + this.rng.range(-0.9, 0.9);

        target = {
          x: clamp(this.pos.x + Math.cos(bearing) * reach, -hw, hw),
          y: clamp(this.pos.y + Math.sin(bearing) * reach, -hh, hh),
        };

        if (
          Math.hypot(target.x - this.pos.x, target.y - this.pos.y) >= minReach
        ) {
          const score = this.memory.valenceAt(target, bounds);

          if (score > bestScore) {
            bestScore = score;
            best = { ...target };
          }
          // A remembered-safe spot ends the search early.
          if (this.memory.dangerAt(target, bounds) < 0.15) break;
        }
      }
      if (!best) {
        // Cornered: every candidate collapsed against the screen edge. A
        // real fly boxed in does not shiver in place — it bolts through
        // open space, past the threat if it must, and that loop out across
        // the middle of the desk is exactly what a viewer expects to see.
        const reach = escape
          ? this.rng.range(ESCAPE_MIN_PX, ESCAPE_MAX_PX)
          : this.rng.range(HOP_MIN_PX * 2, HOP_MAX_PX);
        const bearing =
          Math.atan2(-this.pos.y, -this.pos.x) + this.rng.range(-0.5, 0.5);

        best = {
          x: clamp(this.pos.x + Math.cos(bearing) * reach, -hw, hw),
          y: clamp(this.pos.y + Math.sin(bearing) * reach, -hh, hh),
        };
      }
      target = best;
    }

    this.flightTo = target;

    const dist = Math.hypot(target.x - this.pos.x, target.y - this.pos.y);

    // Distance sets duration, and only a floor is imposed. An upper clamp
    // here would look like a duration limit but would in fact be a licence to
    // exceed the speed limit by however far the flight overshot it: with a
    // 1.4 s cap, anything past 605 px flew faster than a fly can, without
    // ceiling. A longer flight takes longer.
    this.flightDur = escape
      ? Math.max(dist / ESCAPE_PX_S, MIN_ESCAPE_S)
      : Math.max(dist / FLIGHT_PX_S, MIN_FLIGHT_S);
    // Torn wings fly slower.
    this.flightDur *= 1 + 0.4 * Math.max(...this.wingDamage);
    this.flightT = 0;
    this.scareCooldown = escape ? 2 : 2.5;
  }

  /**
   * Sleep homeostasis: pressure builds while awake (faster while active) and
   * discharges during sleep. Crossing the upper bound makes this fly drowsy
   * regardless of the shared clock — individuals nap on their own schedule.
   */
  private updateSleepPressure(dt: number, clock: number): void {
    if (this.state === FlyState.Sleeping) {
      // Naps run minutes, not seconds. A 23 s episode — which is what a
      // 45 s discharge produced, identically for every fly — would not even
      // be scored as sleep: the standard Drosophila criterion is five
      // minutes of immobility. Vigor varies the rate so no two flies wake
      // on the same schedule. Check bout length against that criterion after
      // touching either constant; the first fix cleared 23 s and stopped at
      // 1.6 min, which is still not sleep by the definition.
      this.sleepPressure = Math.max(
        this.sleepPressure -
          dt /
            (SLEEP_DISCHARGE_S * (2 - this.phenotype.vigor) * this.sleepBout),
        0
      );
    } else {
      const effort =
        this.state === FlyState.Walking || this.state === FlyState.Flying
          ? 1.5
          : 1;
      // The circadian half of the two-process model. Thresholds alone only
      // change how long a nap lasts — the *fraction* of life spent asleep
      // is set by how fast pressure builds against how fast it clears, so
      // the clock has to act here. Sleep drive accumulates slowly through
      // the morning and evening peaks and fast through the night trough.
      const clockDrive = 2.2 - 1.6 * clamp(clock, 0.25, 1);

      this.sleepPressure = Math.min(
        this.sleepPressure +
          (dt / SLEEP_CHARGE_S) *
            effort *
            (2 - this.phenotype.vigor) *
            clockDrive,
        1
      );
    }
    // Two-process: the homeostat says how long it has been awake, the clock
    // says whether now is a reasonable time to sleep. At the morning and
    // evening peaks a fly needs to be nearly exhausted before it naps; at
    // the night trough far less will do.
    if (this.sleepPressure > 0.6 + 0.35 * clamp(clock, 0.25, 1)) {
      // Draw this nap's depth as it begins, not once at birth.
      if (!this.drowsy) {
        this.sleepBout = this.rng.range(SLEEP_BOUT_MIN, SLEEP_BOUT_MAX);
      }
      this.drowsy = true;
    } else if (this.sleepPressure < 0.42 * clamp(clock, 0.25, 1)) {
      // Waking is clock-gated too, or night sleep would come out *shorter*
      // than day sleep: a lower onset threshold on its own means entering
      // sleep with less pressure to discharge. Real night sleep is the
      // consolidated kind.
      this.drowsy = false;
    }
  }

  /** A wing tears a little; the wear is permanent and visible. */
  public damageWing(amount: number): void {
    const i = this.rng.float() < 0.5 ? 0 : 1;

    this.wingDamage[i] = Math.min(this.wingDamage[i] + amount, 0.75);
  }

  /**
   * Site fidelity and path integration. Long undisturbed rest at one spot
   * makes it the fly's anchor; from then on the fly integrates its own
   * movement along its compass estimate (the ring attractor's bump, for
   * flies that carry one), and can later walk the vector home. Compass
   * drift makes the homing honestly imperfect, as in the real animal.
   */
  private updateNavigation(dt: number, signals?: Signals): void {
    // A ring attractor's whole point is that the bump persists, so a brief
    // dip in coherence — which is exactly what a sharp turn causes — must
    // not erase the heading estimate. Hold the last reading for a couple of
    // seconds and only then admit the fly has lost its bearings.
    const compass = signals?.compass;

    if (compass && compass.strength > 0.2) {
      this.compassAngle = compass.angle;
      this.compassStale = 0;
    } else if (this.compassAngle !== undefined) {
      this.compassStale += dt;
      if (this.compassStale > 2) this.compassAngle = undefined;
    }

    // Rest long enough in one place and it becomes home.
    const resting =
      this.state === FlyState.Idle ||
      this.state === FlyState.Grooming ||
      this.state === FlyState.Sleeping;

    if (resting) {
      this.restTime += dt;
      if (this.restTime > 6) {
        this.anchor = { ...this.pos };
        this.homeVec = { x: 0, y: 0 };
        this.restTime = 0;
      }
    } else {
      this.restTime = 0;
    }

    // Integrate self-motion along the compass estimate, not the true
    // heading — the error between them is what makes each fly's homing
    // its own.
    if (this.compassAngle !== undefined && this.prevPos) {
      const step = Math.hypot(
        this.pos.x - this.prevPos.x,
        this.pos.y - this.prevPos.y
      );

      if (step > 0.001 && step < 50) {
        this.homeVec.x += Math.cos(this.compassAngle) * step;
        this.homeVec.y += Math.sin(this.compassAngle) * step;
      }
    }
    if (this.prevPos) {
      this.prevPos.x = this.pos.x;
      this.prevPos.y = this.pos.y;
    } else {
      this.prevPos = { x: this.pos.x, y: this.pos.y };
    }

    // The urge to go home: strongest in sitters, far from the anchor.
    if (
      this.homingTimer === 0 &&
      this.anchor &&
      this.state === FlyState.Walking &&
      this.scareCooldown === 0 &&
      this.freezeTimer === 0 &&
      !this.curiosityTarget &&
      Math.hypot(this.anchor.x - this.pos.x, this.anchor.y - this.pos.y) >
        320 &&
      this.rng.float() < (this.phenotype.rover ? 0.015 : 0.05) * dt
    ) {
      // How long it keeps trying, not a fixed contract: every homing bout
      // running for exactly the same 25 s is the tell of a missing draw.
      this.homingTimer = this.rng.range(16, 34);
      // Homing means walking the vector, not pacing whatever rim it
      // happened to be standing on for half a minute.
      this.ledge = undefined;
    }
  }

  /** Which way "home" feels like from here. */
  private homingHeading(): number {
    if (
      this.compassAngle !== undefined &&
      Math.hypot(this.homeVec.x, this.homeVec.y) > 30
    ) {
      // Real path integration: turn until the compass points back along
      // the accumulated outbound vector.
      return (
        this.heading +
        angleDiff(
          this.compassAngle,
          Math.atan2(-this.homeVec.y, -this.homeVec.x)
        )
      );
    }

    // No compass: a rough remembered bearing, with this fly's own error.
    const anchor = this.anchor ?? this.pos;

    return (
      Math.atan2(anchor.y - this.pos.y, anchor.x - this.pos.x) +
      this.phenotype.handedness * 6
    );
  }

  /**
   * Orienting toward distant motion, with nothing but its own eyes: the
   * urge to look comes from LC11 activity, and the turn is visual servoing
   * on the LC11 left/right imbalance — the fly pivots toward the busier
   * eye until the moving thing sits frontal and the eyes balance. The loop
   * closes through the world; there is no target position anywhere.
   */
  private maybeAttend(dt: number, signals: Signals): void {
    if (
      (this.state !== FlyState.Idle && this.state !== FlyState.Walking) ||
      this.freezeTimer > 0 ||
      this.scareCooldown > 0 ||
      this.dartTimer > 0 ||
      this.homingTimer > 0
    ) {
      return;
    }

    if (this.attendTimer > 0) {
      // Watching: hold still and pivot toward the busier eye.
      if (this.state === FlyState.Walking) {
        this.setState(FlyState.Idle);
        this.speed = 0;
      }
      // Positive bias = left eye = turn left (+heading).
      if (Math.abs(signals.lc11Bias) > 0.05) {
        this.heading += clamp(signals.lc11Bias * 6, -4, 4) * dt;
      }

      return;
    }

    // The urge to look is the real LC11 small-object pathway firing; its
    // rate already carries speed, size, and the rear blind cone.
    if (this.attendCooldown > 0 || signals.lc11 < 0.06) return;

    if (
      this.rng.float() <
      this.phenotype.attentiveness * (0.4 + 5 * signals.lc11) * dt
    ) {
      this.attendTimer = this.rng.range(0.7, 1.8);
      this.attendCooldown = this.rng.range(5, 16);
    }
  }

  /**
   * Freezing: the other half of the loom response (Zacarias et al. 2018) —
   * a moderate threat makes a fly lock every joint instead of fleeing.
   */
  public freeze(duration: number): void {
    // A pinned fly is fully occupied, an airborne one cannot lock its legs
    // mid-flight, and a sleeper is already immobile — freezing it would
    // silently force Idle with the sleep pressure intact, and the next
    // frame's sleep signal would snap it straight back: a flicker, not a
    // behaviour. Guarded here, not at the call sites: "the app checks
    // first" is exactly the assumption every pair-bug shipped on.
    if (
      this.state === FlyState.Caught ||
      this.state === FlyState.Flying ||
      this.state === FlyState.Sleeping
    ) {
      return;
    }
    this.setState(FlyState.Idle);
    this.speed = 0;
    this.dartTimer = 0;
    this.tasteTimer = 0;
    this.curiosityTarget = undefined;
    this.freezeTimer = duration;
    this.freezeCooldown = duration + 3;
  }

  /**
   * Small idle habits that read as an animal rather than an animation:
   * abrupt body saccades (flies reorient in sharp pivots, not arcs) and
   * proboscis extension to taste the ground it is standing on.
   */
  private microBehaviors(dt: number): void {
    if (
      this.state !== FlyState.Idle ||
      this.scareCooldown > 0 ||
      this.freezeTimer > 0 ||
      // Watching something is a gaze hold: the orienting servo owns the
      // heading, and a random saccade in the middle of it would throw the
      // gaze off the very thing the fly stopped to look at.
      this.attendTimer > 0
    ) {
      return;
    }

    if (this.rng.float() < 0.25 * dt) {
      this.heading += this.rng.range(-0.9, 0.9);
    }
    if (this.tasteCooldown === 0 && this.rng.float() < 0.12 * dt) {
      this.tasteTimer = this.rng.range(0.6, 1.1);
      this.tasteCooldown = this.rng.range(5, 12);
    }
  }

  /** The pointer got it: pinned in place until it wriggles free. */
  public pin(at: Point): void {
    // Seized mid-nap: sleep inertia makes the first struggles groggy.
    this.grogginess = this.restDepth;
    this.setState(FlyState.Caught);
    this.ledge = undefined;
    this.curiosityTarget = undefined;
    this.freezeTimer = 0;
    this.tasteTimer = 0;
    this.pinnedAt = { ...at };
    this.struggle = 0;
    this.speed = 0;
    this.alt = 0;
    this.z = 0;
    this.scale = this.baseScale;
    this.effortCurrent = 1;
  }

  /**
   * Released, or wriggled free: burst away from the pointer at once.
   *
   * Getting out of a grip costs something either way. A fly that has been
   * thrashing under a fingertip loses wing edge whether the finger opened
   * or it tore itself loose — tearing loose just costs more. And it stays
   * rattled long after: handled flies are skittish for minutes, which is
   * why the second grab is so much harder than the first.
   */
  public release(bounds: Point, tore = false): void {
    const from = this.pinnedAt ? { ...this.pinnedAt } : { ...this.pos };
    const violence = this.struggle * (tore ? 1 : 0.55);

    // A quick grab-and-let-go costs nothing; it takes a real hold, with the
    // animal thrashing against it, before anything tears.
    if (violence > 0.25) {
      this.damageWing(0.08 + 0.3 * violence * this.rng.range(0.5, 1));
    }
    this.agitation = 1;
    this.pinnedAt = undefined;
    this.struggle = 0;
    this.startFlight(bounds, from, true);
  }

  /**
   * An externally imposed running burst — a contest lunge, a fencing dart,
   * the flee from a lost fight. Through setState, not around it: app-level
   * code used to write `state` directly here, which skipped the grooming
   * cooldown and the timer bookkeeping exactly the way land() once did.
   * Speed comes in mm/s so the caller never touches the scene scale.
   */
  public dart(heading: number, mmPerS: number, seconds: number): void {
    if (this.state === FlyState.Caught || this.state === FlyState.Flying) {
      return;
    }
    this.ledge = undefined;
    // A physical shove interrupts whatever the fly was in the middle of:
    // contact breaks a freeze (freezing yields to strong stimuli, Zacarias
    // et al. 2018), retracts the proboscis, and ends a gaze hold. Without
    // this a frozen fly pulled into a contest stayed a statue while its
    // dart timer silently burned, and a mid-taste fly sprinted with its
    // proboscis dragging.
    this.freezeTimer = 0;
    this.tasteTimer = 0;
    this.attendTimer = 0;
    this.curiosityTarget = undefined;
    this.setState(FlyState.Walking);
    this.heading = heading;
    this.speed = mmPerS * SCENE_PX_PER_MM;
    this.dartTimer = seconds;
  }

  /**
   * Woken by touch: another fly blundering into it, mostly. Mechanical
   * disturbance is how the field wakes flies, and the response is a
   * startled scramble, not an escape flight — so the pressure dump is
   * smaller than an escape's and the fly may drop off again sooner.
   */
  public rouse(awayFrom?: Point): void {
    if (this.state !== FlyState.Sleeping) return;

    this.drowsy = false;
    this.sleepPressure = Math.min(this.sleepPressure, 0.55);

    const bearing = awayFrom
      ? Math.atan2(this.pos.y - awayFrom.y, this.pos.x - awayFrom.x)
      : this.rng.range(-PI, PI);

    this.dart(
      bearing + this.rng.range(-0.4, 0.4),
      this.rng.range(9, 14),
      this.rng.range(0.3, 0.6)
    );
  }

  /**
   * A novel object caught this fly's eye: walk over and inspect it. The
   * time budget scales with the walk ahead — a flat 6 s meant anything much
   * past 200 px timed out mid-approach, so distant curiosity silently never
   * arrived, and every bout carried the identical budget besides.
   */
  public investigate(target: Point): void {
    // Freezing suppresses voluntary behaviour; curiosity does not break
    // it. Contact does — which is why dart() clears the freeze and this
    // returns instead. That asymmetry is the real animal's. A sleeper
    // likewise accepts no voluntary program.
    if (
      this.state === FlyState.Caught ||
      this.state === FlyState.Flying ||
      this.state === FlyState.Sleeping ||
      this.freezeTimer > 0
    ) {
      return;
    }
    this.curiosityTarget = { ...target };
    // Step off the rim to reach it — same reason homing drops the ledge: a
    // latched fly walks the edge axis and can never arrive at a target
    // that is not on the edge, so the bout would silently time out.
    this.ledge = undefined;
    this.curiosityTimer = clamp(
      (Math.hypot(target.x - this.pos.x, target.y - this.pos.y) /
        (WALK_BASE_PX_S + 0.35 * WALK_DRIVE_PX_S)) *
        this.rng.range(1.4, 2.2),
      2.5,
      16
    );
    if (this.state === FlyState.Idle) this.setState(FlyState.Walking);
  }

  private updateCaught(dt: number): void {
    this.struggle = Math.min(this.struggle + dt * 1.4, 1);
    if (this.pinnedAt) {
      // Thrashing under the fingertip.
      this.pos.x = this.pinnedAt.x + Math.sin(this.time * 47) * 2.4;
      this.pos.y = this.pinnedAt.y + Math.cos(this.time * 39) * 2.4;
    }
    this.heading += Math.sin(this.time * 31) * 5 * dt;
    this.alt = 0;
    this.z = 0;
    this.scale = this.baseScale;
  }

  private land(): void {
    this.surfaceZ = this.ledge?.z ?? 0;
    // Handled flies always wash. Arm the post-escape groom; it fires only
    // once the fly has been calm for a couple of seconds.
    if (this.agitation > 0.6) {
      this.washTimer = this.rng.range(1.5, 4);
    }
    // Through setState, not around it: assigning the state directly left
    // stateAge running on from the flight, so the fly touched down with the
    // settle already expired and walked off in the same breath.
    this.setState(FlyState.Idle);
    this.speed = 0;
    this.alt = 0;
    this.pitch = 0;
    this.scale = this.baseScale;
    this.z = 0;
    // Refold the wings flat over the abdomen.
    this.setWings(0, 0.13);
  }

  private setState(state: FlyState): void {
    if (state === this.state) return;

    if (this.state === FlyState.Grooming) {
      this.groomCooldown = this.rng.range(
        GROOM_COOLDOWN_MIN,
        GROOM_COOLDOWN_MAX
      );
    }
    this.state = state;
    this.stateAge = 0;
    // How long before it will consider changing its mind again. Real flies
    // walk in runs of seconds and pause for seconds; they do not vibrate
    // between the two. A rattled fly keeps going for longer.
    if (state === FlyState.Walking) {
      this.stateTimer = this.rng.range(0.8, 3) * (1 + 2.5 * this.agitation);
    } else if (state === FlyState.Idle) {
      this.stateTimer = this.rng.range(0.6, 2.5);
    } else {
      this.stateTimer = 0;
    }
    // Each grooming bout hands over from forelegs to hind legs at its own
    // moment, so two flies grooming side by side never do it in step.
    if (state === FlyState.Grooming) {
      this.groomSwitch = this.rng.range(1, 2.4);
      this.groomBout = this.rng.range(GROOM_BOUT_MIN, GROOM_BOUT_MAX);
    }
  }

  public update(dt: number, bounds: Point, signals: Signals): void {
    const headingBefore = this.heading;

    this.time += dt;
    this.scareCooldown = Math.max(this.scareCooldown - dt, 0);
    this.dartCooldown = Math.max(this.dartCooldown - dt, 0);
    this.backwardTimer = Math.max(this.backwardTimer - dt, 0);
    this.stateAge += dt;
    this.dartTimer = Math.max(this.dartTimer - dt, 0);
    this.socialCooldown = Math.max(this.socialCooldown - dt, 0);
    this.stateTimer = Math.max(this.stateTimer - dt, 0);
    this.curiosityTimer = Math.max(this.curiosityTimer - dt, 0);
    if (this.curiosityTimer === 0) this.curiosityTarget = undefined;
    this.freezeTimer = Math.max(this.freezeTimer - dt, 0);
    this.freezeCooldown = Math.max(this.freezeCooldown - dt, 0);
    this.tasteTimer = Math.max(this.tasteTimer - dt, 0);
    this.tasteCooldown = Math.max(this.tasteCooldown - dt, 0);
    this.groomCooldown = Math.max(this.groomCooldown - dt, 0);
    this.subordinateTimer = Math.max(this.subordinateTimer - dt, 0);
    this.displayTimer = Math.max(this.displayTimer - dt, 0);
    this.attendTimer = Math.max(this.attendTimer - dt, 0);
    this.attendCooldown = Math.max(this.attendCooldown - dt, 0);
    this.homingTimer = Math.max(this.homingTimer - dt, 0);
    this.mbPulseCooldown = Math.max(this.mbPulseCooldown - dt, 0);
    // Tau about 45 s: rattled for minutes, not forever.
    this.agitation *= Math.exp(-dt / 45);
    // Sleep inertia clears within a minute of being jolted awake.
    this.grogginess *= Math.exp(-dt / 20);
    // The post-handling wash: counts down only while calm and grounded,
    // then starts a long, vigorous groom — handled flies always wash.
    if (
      this.washTimer > 0 &&
      this.state !== FlyState.Flying &&
      this.state !== FlyState.Caught &&
      this.scareCooldown === 0 &&
      this.dartTimer === 0 &&
      this.freezeTimer === 0
    ) {
      this.washTimer = Math.max(this.washTimer - dt, 0);
      if (
        this.washTimer === 0 &&
        (this.state === FlyState.Idle || this.state === FlyState.Walking)
      ) {
        this.setState(FlyState.Grooming);
        this.speed = 0;
        // A post-handling wash runs long — this is the frantic clean-up,
        // not a casual pass.
        this.groomBout = this.rng.range(6, 12);
      }
    }
    this.memory.decay(dt);
    this.updateSleepPressure(dt, signals.clock);
    this.updateNavigation(dt, signals);
    this.maybeAttend(dt, signals);

    // Live brain drives reach the wings even mid-flight.
    this.liveArousal = signals.arousal;
    this.liveWing = signals.wingDrive;

    // The ground is not guaranteed to still be there. Ledge maintenance
    // used to live only in updateWalk, so a fly asleep (or grooming, or
    // frozen) on a window rim never noticed the window closing: it stayed
    // planted on nothing for the rest of a nine-minute nap — drawn large,
    // shadow elevated, standing on bare wallpaper — then took a spurious
    // "ground vanished" escape minutes after the event, or got teleported
    // sideways when the wake-up re-find snapped it into the window's new
    // span. Every grounded state has to feel the floor move.
    if (
      this.state !== FlyState.Caught &&
      this.state !== FlyState.Flying &&
      this.state !== FlyState.Walking
    ) {
      this.syncStandingLedge(dt, bounds);
    }

    if (this.state === FlyState.Caught) {
      this.updateCaught(dt);
    } else if (this.state === FlyState.Flying) {
      this.updateFlight(dt);
    } else if (this.freezeTimer > 0) {
      // Frozen: utterly motionless — but a giant-fibre spike (a strong loom
      // during the freeze) still breaks it into escape, as in the animal.
      if (signals.escape && this.scareCooldown === 0) {
        this.startFlight(bounds, this.loomAway(signals), true);
      }
    } else {
      this.brainBehavior(signals, dt, bounds);
      if (this.state === FlyState.Walking) this.updateWalk(dt, bounds);
      this.microBehaviors(dt);
    }

    // Proprioceptive turn signal for the compass, smoothed and clamped.
    if (dt > 0) {
      const rate = clamp(angleDiff(headingBefore, this.heading) / dt, -10, 10);

      this.headingRate += (rate - this.headingRate) * Math.min(10 * dt, 1);
    }

    if (this.state !== FlyState.Flying && this.state !== FlyState.Caught) {
      this.applyStandingHeight();
    }
    this.updateLegs(dt);
    this.updateWings(dt);
    // Slower, deeper breathing while asleep.
    this.breath =
      this.state === FlyState.Sleeping
        ? 1 + 0.05 * Math.sin(this.time * 1.1)
        : 1 + 0.03 * Math.sin(this.time * 3);
    // Settling down takes a few seconds; waking snaps back much faster.
    const resting = this.state === FlyState.Sleeping ? 1 : 0;

    this.restDepth +=
      (resting - this.restDepth) * Math.min((resting ? 0.5 : 3) * dt, 1);
  }

  /**
   * A standing (non-walking) fly keeps its footing on a moving world: it
   * rides a dragged window, and startles into the air when the surface
   * underfoot vanishes — a closing window is the ground disappearing, and
   * that is a mechanical event no sleep sleeps through.
   */
  private syncStandingLedge(dt: number, bounds: Point): void {
    if (!this.ledge) return;

    const attached = this.ledge;
    const current = this.terrain.find(
      (candidate) =>
        candidate.id === attached.id && Math.abs(candidate.y - attached.y) < 40
    );

    if (current) {
      // Ride along: shift with the surface rather than being clamped into
      // its new span — a standing fly moves WITH the window it stands on.
      this.pos.x += current.x0 - attached.x0;
      this.pos.x = clamp(this.pos.x, current.x0, current.x1);
      this.pos.y += (current.y - this.pos.y) * Math.min(10 * dt, 1);
      this.ledge = current;

      return;
    }

    // The ground vanished from under it. Falling wakes anything.
    if (this.state === FlyState.Sleeping) {
      this.drowsy = false;
      this.sleepPressure = Math.min(this.sleepPressure, 0.55);
    }
    this.ledge = undefined;
    this.startFlight(bounds);
  }

  /**
   * Where the threat is, as far as this fly can know: nowhere but its own
   * lateralized loom signal. There is no privileged pointer position — the
   * world reaches the fly only through its senses.
   */
  private loomAway(s: Signals): Point | undefined {
    if (Math.abs(s.loomBias) <= 0.15) return undefined;

    // Positive bias = left eye; left of the body is heading + 90°.
    const side = this.heading + (s.loomBias > 0 ? 1 : -1) * (Math.PI / 2);

    return {
      x: this.pos.x + Math.cos(side) * 120,
      y: this.pos.y + Math.sin(side) * 120,
    };
  }

  /** Every decision here reads a real neuron population's rate. */
  private brainBehavior(s: Signals, dt: number, bounds: Point): void {
    // Giant fibre spike: escape takeoff, even out of sleep. The trajectory
    // points away from the loomed side (Card & Dickinson 2008), read off
    // the brain's own lateralized LC populations.
    if (s.escape && this.scareCooldown === 0) {
      this.startFlight(bounds, this.loomAway(s), true);

      return;
    }
    // Circadian sleep: enter, hold, and wake into grooming.
    if (s.sleep) {
      if (this.state !== FlyState.Sleeping) {
        this.setState(FlyState.Sleeping);
        this.speed = 0;
        this.dartTimer = 0;
        this.backwardTimer = 0;
      }

      return;
    }
    if (this.state === FlyState.Sleeping) {
      this.setState(FlyState.Grooming);

      return;
    }
    // A moderate loom that never reaches the giant fibre: sometimes the
    // right move is to freeze solid rather than run (Zacarias et al. 2018).
    // Timid flies freeze longer.
    if (
      s.nervous > 0.22 &&
      s.nervous < 0.4 &&
      this.freezeCooldown === 0 &&
      this.rng.float() < 2 * dt
    ) {
      this.freeze(this.rng.range(0.6, 1.8) / this.phenotype.boldness);

      return;
    }
    // Looming detectors hot but the giant fibre quiet: a nervous dart rather
    // than a full takeoff.
    if (s.nervous > 0.4 && this.dartCooldown === 0) {
      this.ledge = undefined;
      this.setState(FlyState.Walking);
      // Dart away from the loomed side, or anywhere when the loom is
      // balanced — the fly's eyes are its only account of the threat.
      this.heading +=
        Math.abs(s.loomBias) > 0.1
          ? (s.loomBias > 0 ? -1 : 1) * this.rng.range(0.7, 1.6)
          : this.rng.range(-1.5, 1.5);
      this.speed = this.rng.range(15, 22) * SCENE_PX_PER_MM;
      this.dartTimer = this.rng.range(0.4, 0.9);
      this.dartCooldown = 1.2;
    }
    // DNg11 grooming command, with hysteresis so it does not chatter.
    if (this.state !== FlyState.Walking || this.dartTimer === 0) {
      if (
        this.state !== FlyState.Grooming &&
        s.groomDrive > 0.5 &&
        s.nervous < 0.3 &&
        this.groomCooldown === 0 &&
        this.stateTimer === 0
      ) {
        this.setState(FlyState.Grooming);
      } else if (
        this.state === FlyState.Grooming &&
        s.groomDrive < 0.2 &&
        this.stateAge > this.groomBout
      ) {
        this.setState(FlyState.Idle);
      }
    }
    // DNp09 forward-walking command, likewise hysteretic.
    if (
      this.state === FlyState.Idle &&
      s.walkDrive > 0.22 &&
      this.stateTimer === 0
    ) {
      this.setState(FlyState.Walking);
      this.heading += this.rng.range(-0.8, 0.8);
    } else if (
      this.state === FlyState.Walking &&
      this.dartTimer === 0 &&
      s.walkDrive < 0.08 &&
      this.stateTimer === 0
    ) {
      this.setState(FlyState.Idle);
      this.speed = 0;
    }
    // An MDN burst reverses the fly from any grounded state — except that it
    // will not cut a groom short in the first moments. Threat still does:
    // escape, freeze and dart all return above this. Without the guard a
    // burst arriving just after a groom began produced a 0.05 s "bout",
    // which reads as a twitch rather than as an animal cleaning itself.
    if (
      s.backward &&
      this.backwardTimer === 0 &&
      this.dartTimer === 0 &&
      (this.state !== FlyState.Grooming || this.stateAge > this.groomBout)
    ) {
      if (this.state !== FlyState.Walking) {
        this.setState(FlyState.Walking);
        this.speed = 0;
      }
      // Drawn, not fixed: every backward bout lasting exactly 0.5 s was
      // the same zero-variance tell as the sleep and groom bouts.
      this.backwardTimer = this.rng.range(0.3, 0.8);
    }
    // Walking speed follows the forward command; tempo is temperature, and
    // this individual's vigor and rover/sitter allele set its pace.
    if (this.state === FlyState.Walking) {
      if (this.dartTimer === 0 && this.backwardTimer === 0) {
        const target =
          (WALK_BASE_PX_S + s.walkDrive * WALK_DRIVE_PX_S) *
          s.tempo *
          this.phenotype.vigor *
          (this.phenotype.rover ? 1.1 : 0.85) *
          // Still rattled from being handled: a fly walks it off.
          (1 + 0.45 * this.agitation);

        this.speed += (target - this.speed) * Math.min(3 * dt, 1);
      }
      if (!this.ledge) {
        // DNa01/DNa02 steering.
        this.heading += s.turnBias * dt;
      }
    }
    // Spontaneous takeoff, rising smoothly with arousal rather than over a
    // step. The step version (`arousal > 0.5 ? 0.6 : 0.005`) looked fine
    // against an isolated brain and was a disaster in the loop: a walking
    // fly drives its own arousal up through leg proprioception, so it sat
    // above the threshold two thirds of the time and spent a quarter of its
    // life airborne. A curve has no cliff to fall off when rates shift, and
    // an undisturbed fly should mostly be walking, as a real one is.
    const flightChance =
      SPONTANEOUS_FLIGHT_PER_S *
      s.arousal ** AROUSAL_FLIGHT_EXPONENT *
      (this.phenotype.rover ? 1.25 : 0.6);

    if (
      this.state === FlyState.Walking &&
      this.rng.float() < flightChance * dt
    ) {
      this.startFlight(bounds, undefined, false, 0.35 + s.arousal * 0.6);
    }
  }

  private updateWalk(dt: number, bounds: Point): void {
    // Re-find the attached ledge: windows move and close underfoot.
    if (this.ledge) {
      const attached = this.ledge;
      const current = this.terrain.find(
        (candidate) =>
          candidate.id === attached.id &&
          Math.abs(candidate.y - attached.y) < 40
      );

      if (current) {
        this.ledge = current;
      } else {
        this.ledge = undefined;
        // The ground vanished from under it.
        this.startFlight(bounds);

        return;
      }
    }

    if (this.ledge) {
      const { ledge } = this;

      // Walk along the window edge, snapping heading to the axis.
      this.heading += this.rng.range(-1, 1) * 0.2 * dt;

      const along = Math.cos(this.heading) >= 0 ? 0 : PI;

      this.heading += angleDiff(this.heading, along) * Math.min(6 * dt, 1);
      this.pos.x += Math.cos(this.heading) * this.effectiveSpeed() * dt;
      this.pos.y += (ledge.y - this.pos.y) * Math.min(10 * dt, 1);
      if (this.pos.x <= ledge.x0 + 6 && Math.cos(this.heading) < 0) {
        this.heading = 0;
      }
      if (this.pos.x >= ledge.x1 - 6 && Math.cos(this.heading) > 0) {
        this.heading = PI;
      }
      this.pos.x = clamp(this.pos.x, ledge.x0, ledge.x1);
      if (this.rng.float() < 0.05 * dt) {
        // Wander off the edge.
        this.ledge = undefined;
      }
    } else {
      const curious =
        this.curiosityTarget &&
        this.dartTimer === 0 &&
        this.backwardTimer === 0;

      if (
        this.homingTimer > 0 &&
        this.anchor &&
        this.dartTimer === 0 &&
        this.backwardTimer === 0
      ) {
        // The dart guard matters: without it an imposed dart — a contest
        // flee, a nervous startle — was steered toward home at 2.5 rad/s,
        // and 40 of 40 measured darts bent by up to 140 degrees, some of
        // them wheeling back toward the fight they were fleeing.
        // Walking the home vector back to the remembered resting spot.
        const homeDist = Math.hypot(
          this.anchor.x - this.pos.x,
          this.anchor.y - this.pos.y
        );

        if (homeDist < 40) {
          this.homingTimer = 0;
          this.setState(FlyState.Grooming);
          this.speed = 0;
          this.stateTimer = this.rng.range(1, 2.5);

          return;
        }
        this.heading +=
          angleDiff(this.heading, this.homingHeading()) * Math.min(2.5 * dt, 1);
        this.heading += this.rng.range(-1, 1) * 0.35 * dt;
      } else if (curious && this.curiosityTarget) {
        // A novel object nearby: walk over and look at it.
        const { x: tx, y: ty } = this.curiosityTarget;

        if (Math.hypot(tx - this.pos.x, ty - this.pos.y) < 30) {
          this.curiosityTarget = undefined;
          this.setState(FlyState.Idle);
          this.speed = 0;
          this.stateTimer = this.rng.range(0.8, 2);

          return;
        }
        this.heading +=
          angleDiff(
            this.heading,
            Math.atan2(ty - this.pos.y, tx - this.pos.x)
          ) * Math.min(3 * dt, 1);
        this.heading += this.rng.range(-1, 1) * 0.4 * dt;
      } else {
        this.heading += this.rng.range(-1, 1) * 1.6 * dt;
        // Phototaxis: drift toward the brighter side of the wallpaper.
        this.heading += this.lightSteer * dt;
      }
      // Locomotor handedness: this individual's lifelong turning bias.
      this.heading += this.phenotype.handedness * dt;

      const hw = bounds.x / 2 - EDGE_MARGIN;
      const hh = bounds.y / 2 - EDGE_MARGIN;

      if (Math.abs(this.pos.x) > hw || Math.abs(this.pos.y) > hh) {
        const toCentre = Math.atan2(-this.pos.y, -this.pos.x);

        this.heading += angleDiff(this.heading, toCentre) * Math.min(4 * dt, 1);
      }

      const v = this.effectiveSpeed();

      this.pos.x += Math.cos(this.heading) * v * dt;
      this.pos.y += Math.sin(this.heading) * v * dt;
      this.pos.x = clamp(this.pos.x, -bounds.x / 2 + 20, bounds.x / 2 - 20);
      this.pos.y = clamp(this.pos.y, -bounds.y / 2 + 20, bounds.y / 2 - 20);

      // Walked onto a window edge? Latch on.
      const hit = this.terrain.find(
        (ledge) =>
          this.pos.x > ledge.x0 - 8 &&
          this.pos.x < ledge.x1 + 8 &&
          Math.abs(this.pos.y - ledge.y) < 20
      );

      if (hit && this.rng.float() < 0.9 * dt) {
        this.ledge = hit;
        this.heading = Math.cos(this.heading) >= 0 ? 0 : PI;
      }
    }
    this.z = 0.35 * Math.abs(Math.sin(this.gaitPhase * TWO_PI));
    // Climbing onto something raised, or stepping back down off it, takes a
    // moment rather than teleporting the fly's height.
    const standing = this.ledge?.z ?? 0;

    this.surfaceZ += (standing - this.surfaceZ) * Math.min(6 * dt, 1);
  }

  private applyAltitude(): void {
    this.scale = this.baseScale * (1 + 0.8 * this.alt);
    this.z = 90 * this.alt;
  }

  /** Render scale including whatever it is standing on. */
  private applyStandingHeight(): void {
    this.scale = this.baseScale * (1 + 0.35 * (this.surfaceZ / 90));
  }

  private updateFlight(dt: number): void {
    this.flightT = Math.min(this.flightT + dt / this.flightDur, 1);
    if (this.flightT >= 1) {
      // Touchdown flare: hover over the target and settle.
      this.pos.x = this.flightTo.x + Math.sin(this.time * 26) * 1.2;
      this.pos.y = this.flightTo.y + Math.cos(this.time * 22);
      this.pitch = clamp(this.alt * 0.4, 0, 0.35);
      this.alt += (0 - this.alt) * Math.min(18 * dt, 1);
      this.applyAltitude();
      if (this.alt < 0.06) {
        this.pos = { ...this.flightTo };
        // Touching down on the thing it aimed at, if that thing is still
        // *there* when it arrives — windows close and move mid-flight. The
        // match must be by id AND position: latching by id alone onto a
        // window that had moved meant the ledge-follow then dragged the fly
        // through the air to the window's new spot, sliding across the
        // desktop like a puppet on a string.
        this.ledge = this.landingLedge
          ? this.terrain.find(
              ({ id, x0, x1, y }) =>
                id === this.landingLedge?.id &&
                Math.abs(y - this.flightTo.y) < 40 &&
                this.flightTo.x > x0 - 6 &&
                this.flightTo.x < x1 + 6
            )
          : undefined;
        this.landingLedge = undefined;
        this.land();
      }

      return;
    }

    const e = smoothstep(this.flightT);
    const dx = this.flightTo.x - this.flightFrom.x;
    const dy = this.flightTo.y - this.flightFrom.y;
    const len = Math.max(Math.hypot(dx, dy), 1);
    const px = -dy / len;
    const py = dx / len;
    // An intact fly flies *straight*. Real Drosophila cross a room in
    // straight segments broken by discrete body saccades; the only
    // continuous oscillation of the body is at the wingbeat itself, which
    // is 220 Hz and a fraction of a millimetre — invisible. A visible weave
    // on a healthy fly is an animator's flourish, not an animal.
    //
    // Torn wings are the opposite case: the wear is asymmetric, so lift is
    // asymmetric, and the flight really does become unstable. That is what
    // this is for, and why it scales so hard with damage.
    const wear = Math.max(...this.wingDamage);
    const wob =
      Math.sin(this.time * 32) *
      WOBBLE_BASE *
      (1 + WOBBLE_PER_WEAR * wear) *
      Math.sin(this.flightT * PI);

    this.pos.x = this.flightFrom.x + dx * e + px * wob;
    this.pos.y = this.flightFrom.y + dy * e + py * wob;
    this.heading =
      Math.atan2(dy, dx) + Math.sin(this.time * 18) * 0.03 * (1 + 6 * wear);

    // Effort stays live: ongoing escape-DN and arousal activity make the fly
    // beat harder and climb higher part-way through a flight.
    this.effortCurrent = clamp(
      Math.max(
        this.flightEffort,
        this.flightEffort * 0.55 + this.liveArousal * 0.25 + this.liveWing * 0.6
      ),
      0.25,
      1.3
    );

    const riseEnv = Math.min(this.flightT / 0.25, 1);
    const fallEnv = Math.min((1 - this.flightT) / 0.3, 1);
    const target =
      this.effortCurrent *
      Math.min(riseEnv, fallEnv) *
      (0.85 + 0.15 * Math.sin(this.time * 7));

    this.pitch = clamp((target - this.alt) * 2.5, -0.45, 0.45);
    this.alt += (target - this.alt) * Math.min(6 * dt, 1);
    this.applyAltitude();
  }

  private updateLegs(dt: number): void {
    const v = Math.abs(this.effectiveSpeed());
    const walking = this.state === FlyState.Walking && v > 1;

    if (walking) {
      // Stride length sets how fast the legs cycle for a given speed. A
      // 2.5 mm fly takes strides of roughly 0.5-0.8 mm, which is 4-6 px
      // here; the old figure worked out at a full millimetre and left the
      // legs turning over at 3 Hz while the animal walked at 5 mm/s. Real
      // step frequency at that pace is 8-12 Hz.
      const amp = clamp(0.2 + v * 0.0022, 0.2, 0.5);
      const stride = Math.max(2 * amp * STRIDE_SCALE, MIN_STRIDE_PX);
      const freq = clamp(v / stride, 3, 15);

      this.gaitPhase = (this.gaitPhase + freq * dt) % 1;

      // Tripod gait: three legs in stance while three swing.
      const STANCE_FRAC = 0.6;
      const backward = this.backwardTimer > 0;

      this.legs.forEach((leg) => {
        const p = (this.gaitPhase + leg.phase) % 1;

        if (p < STANCE_FRAC) {
          leg.angle = amp * (1 - 2 * (p / STANCE_FRAC));
          leg.lift = 0;
        } else {
          const s = (p - STANCE_FRAC) / (1 - STANCE_FRAC);

          leg.angle = -amp + 2 * amp * smoothstep(s);
          leg.lift = Math.sin(s * PI) * 0.55;
        }
        if (backward) leg.angle = -leg.angle;
      });
    } else if (this.state === FlyState.Grooming) {
      // The real grooming hierarchy runs anterior to posterior (Seeds et
      // al. 2014): the front legs sweep the head first, and once that is
      // done the hind legs take over the wings and abdomen for the rest of
      // the bout. It is a progression, not an alternation — the anterior
      // routine suppresses the posterior one until the head is clean.
      const anterior = this.stateAge < this.groomSwitch;

      this.legs.forEach((leg) => {
        const active = leg.isFront === anterior;

        if (active) {
          leg.angle =
            (leg.isFront ? 0.45 : -0.45) +
            0.25 * Math.sin(this.time * 20 + leg.swingSign * 1.3);
          leg.lift = 0.55 + 0.15 * Math.sin(this.time * 22);
        } else {
          leg.angle += (0 - leg.angle) * Math.min(8 * dt, 1);
          leg.lift += (0 - leg.lift) * Math.min(8 * dt, 1);
        }
      });
    } else if (this.state === FlyState.Flying) {
      this.legs.forEach((leg) => {
        leg.angle += (-0.35 - leg.angle) * Math.min(6 * dt, 1);
        leg.lift += (0.5 - leg.lift) * Math.min(6 * dt, 1);
      });
    } else if (this.state === FlyState.Caught) {
      // All six legs flailing for purchase.
      this.legs.forEach((leg, index) => {
        leg.angle = 0.5 * Math.sin(this.time * 28 + index * 1.7);
        leg.lift = 0.45 + 0.3 * Math.sin(this.time * 24 + index * 2.1);
      });
    } else {
      this.legs.forEach((leg) => {
        leg.angle += (0 - leg.angle) * Math.min(10 * dt, 1);
        leg.lift += (0 - leg.lift) * Math.min(10 * dt, 1);
      });
    }
  }

  private updateWings(dt: number): void {
    // A caught fly buzzes at full effort, wings a blur under the pointer.
    if (this.state !== FlyState.Flying && this.state !== FlyState.Caught) {
      // Grounded threat posture: escape-DN or loom activity raises the wings
      // without taking off.
      const raiseTarget =
        this.state !== FlyState.Sleeping &&
        (this.liveWing > 0.7 || this.dartTimer > 0 || this.displayTimer > 0)
          ? 1
          : 0;

      this.wingRaise += (raiseTarget - this.wingRaise) * Math.min(8 * dt, 1);
      if (this.wingRaise > 0.01) {
        const raise = this.wingRaise;

        this.setWings(-0.5 * raise, 0.13 + 0.3 * raise);
      } else {
        // Settle back to the folded resting pose after anything that left
        // them swept out.
        const k = Math.min(10 * dt, 1);

        this.wings.forEach((wing, i) => {
          const side = i === 0 ? -1 : 1;

          wing.x += (0 - wing.x) * k;
          wing.y += (0 - wing.y) * k;
          wing.z += (side * 0.13 - wing.z) * k;
        });
      }

      return;
    }

    // Visible wing beat: the stroke arc sweeps faster at higher effort.
    this.flapPhase = (this.flapPhase + dt * (14 + 10 * this.effortCurrent)) % 1;

    const stroke = Math.sin(this.flapPhase * TWO_PI);

    this.setWings(stroke * 0.35, 0.45 + 0.35 * (0.5 + 0.5 * stroke));
  }

  /**
   * Set both wings to a mirrored pose. Mutates in place: this runs for every
   * fly on every frame, and rebuilding the pair each time was pure garbage.
   */
  private setWings(x: number, spread: number): void {
    const [left, right] = this.wings;

    left.x = x;
    left.y = 0;
    left.z = -spread;
    right.x = x;
    right.y = 0;
    right.z = spread;
  }
}
