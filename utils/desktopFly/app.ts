// The coordinator: senses in, spikes in the middle, flies on the screen.
// The order inside a frame mirrors gnat's `app.rs` (MIT): sense the desktop,
// drive the circuits, read the population rates as body commands, move the
// bodies, draw. The circuits themselves step in a worker (brain.worker.ts);
// the bodies run on the worker's latest reply, one frame behind the senses.
//
// Where gnat gave one fly the connectome and the rest a distance check, here
// every fly carries its own 9,907-neuron simulation and its own eyes: each
// one sees the cursor, dragged windows, sudden pop-ups, and its neighbours'
// takeoffs from its own position and heading. That is what makes a group
// scatter from an approaching window the way real flies scatter from a hand.

import { Activity } from "utils/desktopFly/activity";
import { FlyAudio } from "utils/desktopFly/audio";
import {
  type BrainResponse,
  type BrainStim,
} from "utils/desktopFly/brain.worker";
import {
  FLIGHT_SPEED_PX_S,
  Fly,
  FlyState,
  type Point,
} from "utils/desktopFly/fly";
import { type Inputs } from "utils/desktopFly/lif";
import {
  drawFly,
  drawRadius,
  type Frame,
  toScene,
} from "utils/desktopFly/render";
import {
  type MovingRect,
  type Threat,
  addThreat,
  appearanceThreat,
  cursorThreat,
  isContact,
  rectThreat,
  smallObjectDrive,
  takeoffStartle,
  tapThreat,
  threatLevel,
} from "utils/desktopFly/senses";
import { type Signals, circadianActivity } from "utils/desktopFly/signals";
import {
  ledgesToScene,
  resetTerrainCache,
  senseTerrain,
} from "utils/desktopFly/terrain";
import {
  SHEEP_ID_BASE,
  WallpaperEye,
  classifyPoint,
  senseSheep,
  senseSound,
} from "utils/desktopFly/vision";
import { Rng } from "utils/desktopFly/rng";

/** How often the window list is re-read, in ms. DOM reads are cheap. */
const TERRAIN_INTERVAL = 150;
/** How often the clock and idle state are re-read, in ms. */
const AMBIENT_INTERVAL = 2000;
/**
 * Every fly carries the full connectome — no second-class reflex flies —
 * so the population cap is the compute budget. Measured: five 9,907-neuron
 * sims cost ~55% of a 60 fps frame and never pass 61% even with every fly
 * looming and reading an object at once, where six of them would spend 84%
 * and leave nothing to render with. Five bigger brains beat six smaller
 * ones — 2,000 more real neurons each, and cheaper at the worst case than
 * the six-fly build was. The sims now step in a worker, but the cap still
 * bounds their worst-case latency behind the frame.
 */
const MAX_FLIES = 5;
/** Ceiling on stimulations held for a worker that is behind or absent. */
const MAX_PENDING_STIMS = 64;
/** Per-second decay rate of transient threat pulses (taps, pop-ups). */
const PULSE_DECAY = 4.5;

/** How often each fly looks at what it is standing on/near, in ms. */
const VISION_INTERVAL = 350;
/**
 * Pointer must land within this many px of a grounded fly to grab it. The fly
 * is only about 19 px long, and it is walking while you aim at it, so reach
 * has to cover a bit more than the body itself.
 */
const GRAB_RADIUS = 36;
/**
 * Hold the pointer down this long on a pinned fly to catch it. Long enough
 * that the struggle is a struggle and not a coin flip.
 */
const CATCH_HOLD_MS = 2600;
/**
 * Per-second chance a pinned fly wriggles out, before the grip and the
 * animal's condition are taken into account. Set so a clean, healthy fly
 * caught off-centre nearly always gets away the first time — the interest
 * is in what repeated handling does to it, not in winning immediately.
 */
const WRIGGLE_CHANCE_PER_S = 0.9;
/**
 * How grip falls off from the centre of the fly to the edge of reach. It is
 * deliberately not linear: a linear falloff left even a perfect grab wriggling
 * at 30% of the edge rate, which over the 2.6 s hold still came to a 65%
 * escape, so a dead-centre grab lost the fly two times in three. Squaring it
 * makes the middle of the animal worth aiming for.
 */
const GRIP_FALLOFF = 1.6;
/** Nothing is unlosable: the best possible grab still wriggles this hard. */
const GRIP_FLOOR = 0.12;

/** How much of it a fully worn-out fly loses. */
const WEAKNESS_PENALTY = 0.6;

/**
 * The numbers that decide whether a person can ever catch one of these. They
 * are exported because catching is a compound of four of them — reach, pin
 * chance, wriggle rate and hold time — and every one looked defensible on its
 * own while the product of them came to a 3% catch per click. Odds like that
 * are only visible if something multiplies them out.
 */
export const CATCH_CALIBRATION = {
  /**
   * Chance a held fly tears loose before the hold completes. `grip` is 0 at
   * the edge of reach and 1 dead centre; `worn` is its worst wing.
   */
  escapeChance: (grip: number, worn = 0): number => {
    const leverage = Math.max((1 - grip) ** GRIP_FALLOFF, GRIP_FLOOR);
    const rate =
      WRIGGLE_CHANCE_PER_S * leverage * (1 - WEAKNESS_PENALTY * worn);

    return 1 - Math.exp((-CATCH_HOLD_MS / 1000) * rate);
  },

  gripFalloff: GRIP_FALLOFF,

  gripFloor: GRIP_FLOOR,

  holdSeconds: CATCH_HOLD_MS / 1000,

  radius: GRAB_RADIUS,

  weaknessPenalty: WEAKNESS_PENALTY,

  wrigglePerS: WRIGGLE_CHANCE_PER_S,
};
/**
 * How far a verdict must sit from this fly's usual before it counts as
 * liking or disliking something. Set from measurement, not taste: after
 * aversive training a punished object reads -3.0 (sd 0.2) and an unpunished
 * control -1.0 (sd 0.25), across five flies. At 2 the punished object is
 * flagged in 5 flies of 5 and the control in none of them.
 */
const VERDICT_BAND = 2;
/** Distance within which two grounded flies notice each other, in px. */
const MEET_RADIUS = 20;
/** Distance within which flies loosely aggregate, in px. */
const GROUP_RADIUS = 180;

const FLY_CANVAS_ID = "desktop-fly";
const CONTEXT_MENU_SELECTOR = "#__next > nav";

const TWO_PI = Math.PI * 2;

const emptyThreat = (): Threat => ({ loomL: 0, loomR: 0, puff: 0 });

/** Standing, grooming, sleeping — anything but airborne or pinned. */
const isGrounded = (fly: Fly): boolean =>
  fly.state !== FlyState.Flying && fly.state !== FlyState.Caught;

/** Neutral body commands, used until the brain worker's first reply. */
const defaultSignals = (): Signals => ({
  arousal: 0,
  backward: false,
  clock: 1,
  escape: false,
  groomDrive: 0,
  lc11: 0,
  lc11Bias: 0,
  loomBias: 0,
  mbApproach: 0,
  mbAvoid: 0,
  nervous: 0,
  sleep: false,
  tempo: 1,
  turnBias: 0,
  walkDrive: 0,
  wingDrive: 0,
});

const defaultInputs = (): Inputs => ({
  activityScale: 1,
  airPuff: 0,
  gaitDrive: 0,
  gaitPhase: 0,
  loomL: 0,
  loomR: 0,
  rotation: 0,
  sensoryGate: 1,
  smallObjL: 0,
  smallObjR: 0,
});

/** An axis-aligned screen box, for dirty-rect clearing. */
type Box = { h: number; w: number; x: number; y: number };

const SIG_LEN = 12;
/** A pose change below this would not move a drawn pixel. */
const SIG_EPS = 0.002;
const sigScratch = new Float64Array(SIG_LEN);

/**
 * The pose fields that decide what drawFly paints. Breathing is left out on
 * purpose — it is sub-pixel at this sprite size — which is what lets a
 * settled fly skip repaints entirely.
 */
const fillPoseSig = (fly: Fly, out: Float64Array): void => {
  let legs = 0;

  fly.legs.forEach(({ angle, lift }) => {
    legs += Math.abs(angle) + lift;
  });
  /* eslint-disable no-param-reassign */
  out[0] = fly.pos.x;
  out[1] = fly.pos.y;
  out[2] = fly.heading;
  out[3] = fly.scale;
  out[4] = fly.z + fly.surfaceZ;
  out[5] = fly.restDepth;
  out[6] = fly.wingRaise;
  out[7] = fly.tasteTimer > 0 ? fly.time : 0;
  out[8] = legs;
  out[9] = fly.wings[0].x;
  out[10] = fly.wings[0].z;
  out[11] = fly.state;
  /* eslint-enable no-param-reassign */
};

/** Whether this fly's on-screen pose differs from its last drawn one. */
const poseChanged = (fly: Fly, sig: Float64Array): boolean => {
  fillPoseSig(fly, sigScratch);

  for (let k = 0; k < SIG_LEN; k += 1) {
    if (Math.abs(sigScratch[k] - sig[k]) > SIG_EPS) return true;
  }

  return false;
};

/**
 * Everything that happens when two flies come into contact, for one
 * unordered pair per frame: a sleeper woken by the bump, same-sex
 * aggression contests with the real winner/loser effect, mixed-sex
 * fencing, and the personal-space shove. Exported so the tests can run two
 * real flies through it — this logic previously lived inline in a private
 * method and had zero behavioural coverage; its worst shipped bug (the
 * loser charging through the winner) was only ever caught by hand.
 *
 * The agonistic program is sexually dimorphic (Nilsen et al. 2004): males
 * lunge with a raised-wing threat display held over the rout; females
 * headbutt and shove — no wing threat, shorter pursuit.
 */
export const socialContact = (a: Fly, b: Fly, dt: number): void => {
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const dist = Math.hypot(dx, dy);

  if (dist > MEET_RADIUS + 6) return;

  /* eslint-disable no-param-reassign */
  // Blundering into a sleeper wakes it — mechanical disturbance is
  // literally how the field rouses flies. Without this a walker silently
  // shoved a sleeping fly across the floor, legs still, like furniture.
  if (
    dist < MEET_RADIUS &&
    Math.abs(a.surfaceZ - b.surfaceZ) < 3 &&
    (a.state === FlyState.Sleeping) !== (b.state === FlyState.Sleeping)
  ) {
    const sleeper = a.state === FlyState.Sleeping ? a : b;
    const bumper = a.state === FlyState.Sleeping ? b : a;

    sleeper.rouse(bumper.pos);
    sleeper.socialCooldown = 2;
    bumper.socialCooldown = 2;
  }

  if (
    dist < MEET_RADIUS &&
    a.socialCooldown === 0 &&
    b.socialCooldown === 0 &&
    // Contact needs contact: a fly on a titlebar and a fly on the desktop
    // under it share an (x, y) but not a surface, and two flies were
    // fighting through the glass.
    Math.abs(a.surfaceZ - b.surfaceZ) < 3 &&
    // A sleeper is not a contestant. Pulled into one it flickered: the
    // contest forced Walking, the still-high sleep pressure forced
    // Sleeping right back, and the "fight" was one frame.
    a.state !== FlyState.Sleeping &&
    b.state !== FlyState.Sleeping
  ) {
    // `away` is the bearing from b toward a; the fight resolves along it.
    const away = Math.atan2(-dy, -dx);
    const contest = a.phenotype.sex === b.phenotype.sex;

    if (contest) {
      const male = a.phenotype.sex === "male";
      // Odds from size, vigor, and each fly's win/loss history.
      const scoreA =
        a.phenotype.size * a.phenotype.vigor +
        0.08 * a.dominance -
        (a.subordinateTimer > 0 ? 0.3 : 0);
      const scoreB =
        b.phenotype.size * b.phenotype.vigor +
        0.08 * b.dominance -
        (b.subordinateTimer > 0 ? 0.3 : 0);
      const aWins = Math.random() < scoreA / Math.max(scoreA + scoreB, 0.001);
      const winner = aWins ? a : b;
      const loser = aWins ? b : a;
      // A rout is a chase: BOTH flies move the same way, loser in front.
      // This used to give the loser the opposite bearing, which pointed at
      // the winner — so every lost fight ended with the loser bolting
      // straight through the fly that had just beaten it.
      const chase = aWins ? away + Math.PI : away;

      winner.socialCooldown = 4;
      if (male) {
        // Winner lunges after the loser, wings raised in threat, and holds
        // the display over the rout for a second or two.
        winner.dart(chase, 12 + Math.random() * 3, 0.25 + Math.random() * 0.15);
        winner.wingRaise = 1;
        winner.displayTimer = 1.2 + Math.random() * 1.3;
      } else {
        // Females headbutt: a shorter shove, and no raised-wing display —
        // that posture is the male program, and half this population is
        // female.
        winner.dart(chase, 10 + Math.random() * 2, 0.15 + Math.random() * 0.1);
      }
      winner.dominance = Math.min(winner.dominance + 1, 6);

      // Loser bolts ahead of it and stays submissive for a while.
      loser.socialCooldown = 4;
      loser.dart(
        chase + (Math.random() - 0.5) * 0.6,
        17 + Math.random() * 4,
        0.4 + Math.random() * 0.3
      );
      loser.dominance = Math.max(loser.dominance - 1, -6);
      loser.subordinateTimer = 60 + Math.random() * 60;
    } else {
      [a, b].forEach((fly, k) => {
        fly.socialCooldown = 3;
        fly.dart(
          away + (k === 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.8,
          13 + Math.random() * 4,
          0.3 + Math.random() * 0.2
        );
      });
    }
  }

  // Personal space: shoulder apart when nearly overlapping — but only on
  // the same surface, and never a sleeping or frozen body: two sleepers
  // touching simply stay huddled (real flies sleep in contact), and a
  // frozen fly is not furniture to slide across the floor.
  if (
    dist > 0.01 &&
    dist < 14 &&
    Math.abs(a.surfaceZ - b.surfaceZ) < 3 &&
    a.state !== FlyState.Sleeping &&
    b.state !== FlyState.Sleeping &&
    a.freezeTimer === 0 &&
    b.freezeTimer === 0
  ) {
    const push = ((14 - dist) / dist) * 2 * dt;

    a.pos.x -= dx * push;
    a.pos.y -= dy * push;
    b.pos.x += dx * push;
    b.pos.y += dy * push;
  }
  /* eslint-enable no-param-reassign */
};

/** Shortest-arc fraction `k` of the turn from `from` toward `to`. */
const steerToward = (from: number, to: number, k: number): number => {
  let d = (to - from) % TWO_PI;

  if (d > Math.PI) d -= TWO_PI;
  if (d < -Math.PI) d += TWO_PI;

  return from + d * k;
};

export class FlyApp {
  private readonly canvas: HTMLCanvasElement;

  private readonly ctx: CanvasRenderingContext2D;

  private readonly container: HTMLElement;

  /** The brain worker: every fly's connectome sim, off the main thread. */
  private readonly worker: Worker;

  private workerReady = false;

  /** A frame batch is in flight; hold new ones until the reply lands. */
  private brainBusy = false;

  private brainSentMs = 0;

  /** Sensed time not yet shipped to the worker, seconds. */
  private pendingDt = 0;

  /** Bumped on any add/remove so stale worker replies can be dropped. */
  private roster = 0;

  /** Latest body commands per fly — one frame behind the brain, by design. */
  private signals: Signals[] = [];

  /** Per-fly brain inputs, rewritten in place each frame. */
  private inputsList: Inputs[] = [];

  /** Stimulations queued for the worker's next frame batch. */
  private readonly pendingStims: BrainStim[] = [];

  /** Reused per-frame scratch: scene bounds and one fly's threat. */
  private readonly bounds: Point = { x: 0, y: 0 };

  private readonly threatScratch: Threat = emptyThreat();

  /** Dirty-rect bookkeeping: last drawn box + pose signature per fly. */
  private drawBoxes: Box[] = [];

  private drawSigs: Float64Array[] = [];

  private readonly flashBox: Box = { h: 0, w: 0, x: 0, y: 0 };

  private fullRedraw = true;

  private flies: Fly[] = [];

  /** Per-fly transient threat pulses (taps, pop-ups, neighbour takeoffs). */
  private pulses: Threat[] = [];

  private wasFlying: boolean[] = [];

  private nextSeed: number;

  private readonly activity = new Activity();

  private terrain: ReturnType<typeof ledgesToScene> = [];

  /** Window boxes with drag velocities, in scene coordinates. */
  private movingRects: MovingRect[] = [];

  private prevRectPos = new Map<number, { t: number; x: number; y: number }>();

  private knownWindowIds = new Set<number>();

  private terrainPolled = false;

  private menuWasOpen = false;

  private lastFrameMs = performance.now();

  private lastTerrainMs = 0;

  private lastAmbientMs = 0;

  private frame: Frame = { height: 0, width: 0 };

  private mouseClient?: Point;

  private mouse?: Point;

  private prevMouse?: Point;

  private mouseVel: Point = { x: 0, y: 0 };

  private loomOverride = 0;

  private sleepy = false;

  private circadian = 1;

  /** Local hour of day (fractional), for per-fly chronotypes. */
  private hour = 12;

  private pokePending = false;

  private clickClient?: Point;

  /** The wallpaper-pixel sense, shared by every fly. */
  private readonly eye = new WallpaperEye();

  /** Audible media sources, in scene coordinates. */
  private soundScene: { intensity: number; x: number; y: number }[] = [];

  /** Index of the fly pinned under the held-down pointer, -1 for none. */
  private catchIndex = -1;

  private catchStartMs = 0;

  /**
   * How square the grab was, 0 at the edge of reach to 1 dead centre. A fly
   * pinned across the middle has far less purchase to push against.
   */
  private catchGrip = 0;

  /** A brief ring drawn where a fly was successfully caught. */
  private catchFlash?: { ms: number; x: number; y: number };

  /** Wing-hum output, opt-in via `fly audio on`. */
  private audio?: FlyAudio;

  private rafId = 0;

  private running = false;

  public constructor(circuitUrl: string, container: HTMLElement) {
    const seed = Math.floor(Date.now() / 256);

    this.nextSeed = seed;
    this.container = container;
    // The worker fetches and compiles the circuit itself; until it reports
    // ready the flies run on neutral default commands.
    this.worker = new Worker(
      new URL("utils/desktopFly/brain.worker", import.meta.url),
      { name: "fly-brains" }
    );
    this.worker.addEventListener("message", this.onBrainMessage, {
      passive: true,
    });
    this.worker.postMessage({ type: "init", url: circuitUrl });
    this.canvas = document.createElement("canvas");
    this.canvas.id = FLY_CANVAS_ID;
    this.canvas.style.position = "absolute";
    this.canvas.style.inset = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "2000";
    this.canvas.setAttribute("aria-hidden", "true");
    container.append(this.canvas);

    const ctx = this.canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) throw new Error("desktop-fly: no 2d canvas context");

    this.ctx = ctx;
    this.resize();
  }

  private readonly onMouseMove = (event: MouseEvent): void => {
    this.mouseClient = { x: event.clientX, y: event.clientY };
    this.pokePending = true;
  };

  /**
   * A click is a tap on the substrate — a swat, to any fly near it. Landing
   * the press directly on a grounded fly is a grab attempt: hold it pinned
   * long enough and it is caught.
   */
  private readonly onMouseDown = (event: MouseEvent): void => {
    this.clickClient = { x: event.clientX, y: event.clientY };
    this.pokePending = true;
    this.tryGrab(this.clickClient);
  };

  private readonly onMouseUp = (): void => {
    // Let go before the catch completed: the fly bursts free.
    if (this.catchIndex >= 0) {
      const held = this.flies[this.catchIndex];

      if (held && held.state === FlyState.Caught) {
        held.release({ x: this.frame.width, y: this.frame.height });
      }
      this.catchIndex = -1;
    }
  };

  private readonly onKeyDown = (): void => {
    this.pokePending = true;
  };

  private readonly onBrainMessage = ({
    data,
  }: MessageEvent<BrainResponse>): void => {
    if (data.type === "ready") {
      this.workerReady = true;

      return;
    }

    this.brainBusy = false;
    // A reply computed for an out-of-date fly list (an add/remove crossed
    // it in flight) is dropped; the next frame batch re-syncs.
    if (data.roster !== this.roster) return;

    data.signals.forEach((made, i) => {
      this.signals[i] = made;
    });
  };

  /** Try to pin a fly under a fresh pointer-down. */
  private tryGrab(client: Point): void {
    if (this.catchIndex >= 0) return;

    const [x, y] = toScene(this.frame, client.x, client.y);
    let nearest = -1;
    let nearestDist = GRAB_RADIUS;

    this.flies.forEach((candidate, i) => {
      if (
        candidate.state === FlyState.Flying ||
        candidate.state === FlyState.Caught
      ) {
        return;
      }

      const dist = Math.hypot(candidate.pos.x - x, candidate.pos.y - y);

      if (dist < nearestDist) {
        nearest = i;
        nearestDist = dist;
      }
    });

    if (nearest < 0) return;

    const fly = this.flies[nearest];
    // A press that lands on a calm fly pins it. This used to succeed half the
    // time, and a fly already on alert only one time in five — which meant
    // most well-aimed clicks did nothing observable at all and the whole
    // mechanic read as broken. The difficulty belongs in the struggle, where
    // it is visible: you see the animal thrash and tear itself loose. A fly
    // that is already alert still slips the fingers sometimes, and one that
    // has taken off is not grabbable at all.
    const grabChance = fly.scareCooldown > 0 || fly.dartTimer > 0 ? 0.6 : 1;

    if (fly.state === FlyState.Sleeping || Math.random() < grabChance) {
      fly.pin({ x, y });
      this.catchIndex = nearest;
      this.catchStartMs = performance.now();
      this.catchGrip = 1 - nearestDist / GRAB_RADIUS;
    }
  }

  public get count(): number {
    return this.flies.length;
  }

  public addFly(): void {
    if (this.flies.length >= MAX_FLIES) return;

    const rng = new Rng(this.nextSeed);

    this.nextSeed += 1;

    const hw = Math.max(this.frame.width / 2 - 100, 50);
    const hh = Math.max(this.frame.height / 2 - 100, 50);
    const fly = new Fly(
      { x: rng.range(-hw, hw), y: rng.range(-hh, hh) },
      this.nextSeed
    );

    // Every fly gets its own connectome in the worker — its own seed, so no
    // two brains crackle alike.
    this.flies.push(fly);
    this.worker.postMessage({ seed: this.nextSeed, type: "add" });
    this.roster += 1;
    this.signals.push(defaultSignals());
    this.inputsList.push(defaultInputs());
    this.pulses.push(emptyThreat());
    this.wasFlying.push(false);
    this.drawBoxes.push({ h: 0, w: 0, x: 0, y: 0 });
    this.drawSigs.push(new Float64Array(SIG_LEN));
    if (!this.running) this.start();
  }

  /** Remove the most recently added fly. */
  public removeFly(): void {
    if (this.flies.length > 0) this.removeFlyAt(this.flies.length - 1);
  }

  private removeFlyAt(index: number): void {
    this.flies.splice(index, 1);
    this.worker.postMessage({ index, type: "remove" });
    this.roster += 1;
    this.signals.splice(index, 1);
    this.inputsList.splice(index, 1);
    this.pulses.splice(index, 1);
    this.wasFlying.splice(index, 1);
    this.drawBoxes.splice(index, 1);
    this.drawSigs.splice(index, 1);
    // Queued stimulations refer to positions in the old list.
    for (let s = this.pendingStims.length - 1; s >= 0; s -= 1) {
      const stim = this.pendingStims[s];

      if (stim.index === index) this.pendingStims.splice(s, 1);
      else if (stim.index > index) stim.index -= 1;
    }
    this.fullRedraw = true;
    if (this.catchIndex === index) this.catchIndex = -1;
    else if (this.catchIndex > index) this.catchIndex -= 1;
    if (this.flies.length === 0) this.stop();
  }

  /** A deliberate scare: a real loom into every circuit at once. */
  public scare(): void {
    this.loomOverride = 0.6;
  }

  /** Switch the audible wing hum on or off. */
  public setAudio(enabled: boolean): void {
    if (enabled) {
      this.audio ??= new FlyAudio();
      this.audio.enable();
    } else {
      this.audio?.disable();
    }
  }

  private start(): void {
    // The app may be restarted after a full stop (e.g. the last fly was
    // caught): re-attach the canvas and input listeners. Re-adding an
    // identical listener is a no-op, so this is safe on first start too.
    if (!this.canvas.isConnected) {
      this.container.append(this.canvas);
      this.resize();
    }
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    window.addEventListener("mousedown", this.onMouseDown, {
      capture: true,
      passive: true,
    });
    window.addEventListener("mouseup", this.onMouseUp, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", this.onKeyDown, {
      capture: true,
      passive: true,
    });
    window.DEBUG_FLY_APP = this;
    this.running = true;
    this.lastFrameMs = performance.now();
    this.rafId = window.requestAnimationFrame(this.onFrame);
  }

  public stop(): void {
    this.running = false;
    window.cancelAnimationFrame(this.rafId);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown, {
      capture: true,
    });
    window.removeEventListener("mouseup", this.onMouseUp, { capture: true });
    window.removeEventListener("keydown", this.onKeyDown, { capture: true });
    this.canvas.remove();
    this.audio?.disable();
    this.catchIndex = -1;
    this.flies = [];
    this.signals = [];
    this.inputsList = [];
    this.pulses = [];
    this.wasFlying = [];
    this.drawBoxes = [];
    this.drawSigs = [];
    this.pendingStims.length = 0;
    this.pendingDt = 0;
    this.fullRedraw = true;
    this.roster += 1;
    this.worker.postMessage({ type: "reset" });
    resetTerrainCache();
    window.DEBUG_FLY_APP = undefined;
  }

  /** Stop and release the brain worker. The instance cannot be restarted. */
  public destroy(): void {
    this.stop();
    this.worker.terminate();
  }

  private resize(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.frame = { height, width };
    this.terrain = [];
    this.movingRects = [];
    this.prevRectPos.clear();
    this.lastTerrainMs = 0;
    // Resetting the canvas size wiped it; everything must repaint.
    this.fullRedraw = true;
  }

  private readonly onFrame = (nowMs: number): void => {
    if (!this.running) return;

    // Clamped: a stalled tab must not teleport the flies.
    const rawDt = (nowMs - this.lastFrameMs) / 1000;
    const dt = Math.min(Math.max(rawDt, 0), 0.05);

    // Coming back from a stall — a hidden tab (rAF pauses), a long GC, a
    // dragged window on a slow machine. dt is clamped, but the cursor's
    // *displacement* over the gap is not: dividing it by the clamped dt
    // manufactured an apparent hand speed of tens of thousands of px/s, so
    // every return to the tab began with all the flies near the pointer
    // scattering from a phantom swipe nobody made.
    if (rawDt > 0.35) {
      this.prevMouse = undefined;
      this.mouseVel = { x: 0, y: 0 };
    }

    this.lastFrameMs = nowMs;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    if (width !== this.frame.width || height !== this.frame.height) {
      this.resize();
    }

    if (this.pokePending) {
      this.pokePending = false;
      this.activity.poke();
    }
    this.activity.tick(dt);

    if (nowMs - this.lastTerrainMs >= TERRAIN_INTERVAL) {
      this.pollTerrain(nowMs);
      this.lastTerrainMs = nowMs;
    }
    if (nowMs - this.lastAmbientMs >= AMBIENT_INTERVAL) {
      this.lastAmbientMs = nowMs;
      this.pollAmbient();
    }
    this.pollVision(nowMs);
    if (this.mouseClient) {
      const [x, y] = toScene(
        this.frame,
        this.mouseClient.x,
        this.mouseClient.y
      );

      if (this.mouse) {
        this.mouse.x = x;
        this.mouse.y = y;
      } else {
        this.mouse = { x, y };
      }
    }

    this.bounds.x = this.frame.width;
    this.bounds.y = this.frame.height;
    this.senseFrame(dt);

    const { bounds } = this;

    this.flies.forEach((fly, i) => {
      // eslint-disable-next-line no-param-reassign
      fly.terrain = this.terrain;

      const made = this.signals[i];

      fly.update(dt, bounds, made);
      // The giant-fibre latch is one-shot: a reply's escape spike must not
      // fire again on frames that reuse it.
      made.escape = false;
    });

    this.updateCatch(nowMs, dt);
    this.interactFlies(dt);
    this.propagateTakeoffs();

    this.drawScene(nowMs);
    this.audio?.update(this.flies, this.frame.width);

    // Catching the last fly stops the app mid-frame; don't reschedule.
    if (this.running) {
      this.rafId = window.requestAnimationFrame(this.onFrame);
    }
  };

  /** Progress a grab in flight: track the pointer, wriggle, or catch. */
  private updateCatch(nowMs: number, dt: number): void {
    if (this.catchIndex < 0) return;

    const fly = this.flies[this.catchIndex];

    if (!fly || fly.state !== FlyState.Caught) {
      this.catchIndex = -1;

      return;
    }

    const { bounds } = this;

    // The pinned fly is dragged along under the pointer.
    if (this.mouse) {
      if (fly.pinnedAt) {
        fly.pinnedAt.x = this.mouse.x;
        fly.pinnedAt.y = this.mouse.y;
      } else {
        fly.pinnedAt = { ...this.mouse };
      }
    }
    // Being held is the worst thing that ever happened here.
    fly.memory.recordThreat(fly.pos, bounds, dt * 2);

    if (nowMs - this.catchStartMs >= CATCH_HOLD_MS) {
      // Caught! The fly is gone; a little ring marks the spot.
      this.catchFlash = { ms: nowMs, x: fly.pos.x, y: fly.pos.y };
      this.removeFlyAt(this.catchIndex);
    } else if (Math.random() < this.escapeRate(fly) * dt) {
      // Tearing itself out from under a fingertip costs a wing edge;
      // release() prices that from how hard it was thrashing.
      fly.release(bounds, true);
      this.catchIndex = -1;
    }
  }

  /**
   * How hard this fly is to hold, per second. Two things govern it: where
   * the grab landed, and how worn the animal already is. A fly caught by
   * the edge has leverage and gets away; one pinned through the middle has
   * none. And every previous escape has cost it wing, so the fly you have
   * caught and lost three times is the one you finally keep — which is the
   * grim part of doing this to something.
   */
  private escapeRate(fly: Fly): number {
    const grip = Math.max((1 - this.catchGrip) ** GRIP_FALLOFF, GRIP_FLOOR);
    const worn = Math.max(...fly.wingDamage);
    const strength = 1 - WEAKNESS_PENALTY * worn;

    // Sleep inertia, not desk ambience: a fly seized mid-nap fights the
    // grip groggily for a while (pin() captures its restDepth), but a
    // wide-awake fly at a quiet desk struggles at full strength.
    return WRIGGLE_CHANCE_PER_S * grip * strength * (1 - 0.5 * fly.grogginess);
  }

  /**
   * Dirty-rect drawing: clear only where flies were and are, and skip the
   * frame entirely when nothing on screen would change (every fly settled,
   * no catch flash live or lingering). drawFly paints legs, wings and the
   * shadow well outside the body centre, so each fly's box comes from
   * drawRadius — the renderer's own account of its extents.
   */
  private drawScene(nowMs: number): void {
    let dirty =
      this.fullRedraw || this.catchFlash !== undefined || this.flashBox.w > 0;

    for (let i = 0; i < this.flies.length && !dirty; i += 1) {
      dirty = poseChanged(this.flies[i], this.drawSigs[i]);
    }
    if (!dirty) return;

    const { ctx, frame } = this;

    if (this.fullRedraw) {
      ctx.clearRect(0, 0, frame.width, frame.height);
      this.fullRedraw = false;
    } else {
      // Clear every fly's previous box, then repaint every fly: with at
      // most five small sprites, that beats tracking box intersections.
      this.drawBoxes.forEach(({ h, w, x, y }) => {
        if (w > 0) ctx.clearRect(x, y, w, h);
      });
      if (this.flashBox.w > 0) {
        ctx.clearRect(
          this.flashBox.x,
          this.flashBox.y,
          this.flashBox.w,
          this.flashBox.h
        );
      }
    }
    this.flashBox.w = 0;

    this.flies.forEach((fly, i) => {
      drawFly(ctx, fly, frame);
      fillPoseSig(fly, this.drawSigs[i]);

      const r = drawRadius(fly);
      const box = this.drawBoxes[i];

      box.x = fly.pos.x + frame.width / 2 - r;
      box.y = frame.height / 2 - fly.pos.y - r;
      box.w = r * 2;
      box.h = r * 2;
    });
    this.drawCatchFlash(nowMs);
  }

  private drawCatchFlash(nowMs: number): void {
    if (!this.catchFlash) return;

    const age = (nowMs - this.catchFlash.ms) / 400;

    if (age >= 1) {
      this.catchFlash = undefined;

      return;
    }

    const x = this.catchFlash.x + this.frame.width / 2;
    const y = this.frame.height / 2 - this.catchFlash.y;

    this.ctx.beginPath();
    this.ctx.arc(x, y, 6 + 26 * age, 0, TWO_PI);
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${(0.8 * (1 - age)).toFixed(3)})`;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    // The ring's box: radius tops out at 32 px, plus the stroke.
    this.flashBox.x = x - 36;
    this.flashBox.y = y - 36;
    this.flashBox.w = 72;
    this.flashBox.h = 72;
  }

  /**
   * Fly-to-fly encounters: personal space, a startled fencing dart when two
   * walk into each other, and the loose aggregation real Drosophila show —
   * calm flies drift toward nearby company.
   */
  private interactFlies(dt: number): void {
    const count = this.flies.length;

    if (count < 2) return;

    for (let i = 0; i < count; i += 1) {
      const a = this.flies[i];

      if (isGrounded(a)) {
        let cx = 0;
        let cy = 0;
        let near = 0;

        for (let j = 0; j < count; j += 1) {
          const b = this.flies[j];
          const dx = b.pos.x - a.pos.x;
          const dy = b.pos.y - a.pos.y;
          const dist = Math.hypot(dx, dy);

          if (j !== i && isGrounded(b) && dist <= GROUP_RADIUS) {
            cx += dx;
            cy += dy;
            near += 1;

            if (j > i) socialContact(a, b, dt);
          }
        }

        // Aggregation: an occasional nudge toward the local group's centre,
        // scaled by how gregarious this particular fly is.
        if (
          near > 0 &&
          a.state === FlyState.Walking &&
          !a.ledge &&
          !a.curiosityTarget &&
          a.homingTimer === 0 &&
          a.scareCooldown === 0 &&
          a.dartTimer === 0 &&
          Math.random() < 0.15 * a.phenotype.sociability * dt
        ) {
          a.heading = steerToward(
            a.heading,
            Math.atan2(cy / near, cx / near),
            0.3
          );
        }
      }
    }
  }

  /** Escape contagion: a takeoff is sudden motion in every neighbour's eye. */
  private propagateTakeoffs(): void {
    this.flies.forEach((fly, i) => {
      const flying = fly.state === FlyState.Flying;

      if (flying && !this.wasFlying[i]) {
        this.flies.forEach((other, j) => {
          if (i === j) return;

          const pulse = takeoffStartle(other.pos, other.heading, fly.pos);

          if (threatLevel(pulse) > 0.01) addThreat(this.pulses[j], pulse);
        });
      }
      this.wasFlying[i] = flying;
    });
  }

  /**
   * Each grounded fly looks at what it is standing on and what lies ahead:
   * icons by name, windows by title, sheep, the taskbar, bare wallpaper.
   * Sightings go into that fly's memory; a novel object can pull a calm fly
   * over to investigate, and the wallpaper's brightness gradient steers it
   * (toward light awake, toward dark when sleepy) — Drosophila phototaxis.
   *
   * Every fly looks on its own staggered clock with its own jitter, so a
   * crowd never reacts to the world in lockstep.
   */
  private pollVision(nowMs: number): void {
    const { height, width } = this.frame;

    this.flies.forEach((fly, flyIndex) => {
      if (nowMs < fly.nextLookMs) return;
      /* eslint-disable no-param-reassign */
      fly.nextLookMs = nowMs + VISION_INTERVAL * (0.7 + Math.random() * 0.9);

      if (
        fly.state === FlyState.Flying ||
        fly.state === FlyState.Caught ||
        // Asleep is not looking. Left in this loop, a nine-minute nap kept
        // presenting whatever sat ahead to the mushroom body the whole
        // time — visual fixation, memory updates and phototaxis from an
        // animal whose eyes have effectively signed off.
        fly.state === FlyState.Sleeping
      ) {
        fly.lightSteer = 0;
        /* eslint-enable no-param-reassign */

        return;
      }

      const sx = fly.pos.x + width / 2;
      const sy = height / 2 - fly.pos.y;
      const under = classifyPoint(sx, sy);

      if (under) {
        fly.memory.observe(under.key, under.kind, under.label, fly.pos);
      }

      // A second sample a body-length or two ahead, along the heading.
      const ax = fly.pos.x + Math.cos(fly.heading) * 60;
      const ay = fly.pos.y + Math.sin(fly.heading) * 60;
      const ahead = classifyPoint(ax + width / 2, height / 2 - ay);

      // Present what the fly is looking at to its mushroom body through
      // the real input pathway: the object's projection-neuron combination
      // fires, the sparse KC code condenses through the PN->KC claws and
      // APL inhibition, MBONs read it through their (possibly depressed)
      // synapses, and any dopamine that arrives while the code is active
      // teaches it.
      const focus = [ahead, under].find(
        (seen) =>
          seen &&
          (seen.kind === "icon" ||
            seen.kind === "sheep" ||
            seen.kind === "window")
      );

      if (focus) {
        this.pendingStims.push({
          durationMs: Math.round(VISION_INTERVAL * 1.6),
          index: flyIndex,
          key: focus.key,
          salt: fly.mbSalt,
          strength: 0.1,
        });
        if (fly.mbFocusKey !== focus.key) {
          /* eslint-disable no-param-reassign */
          fly.mbFocusKey = focus.key;
          fly.mbEvoked = 0;
          /* eslint-enable no-param-reassign */
        }
        // eslint-disable-next-line no-param-reassign
        fly.mbFocusMs = nowMs;
      }

      if (ahead && ahead.key !== under?.key) {
        const novelty = fly.memory.observe(ahead.key, ahead.kind, ahead.label, {
          x: ax,
          y: ay,
        });
        const interesting =
          ahead.kind === "icon" ||
          ahead.kind === "sheep" ||
          ahead.kind === "window";

        // The mushroom body's learned verdict on this object. A fly that
        // has associated it with punishment refuses to investigate and
        // steers off; one that has learned it is safe approaches more.
        // Relative to this fly's own usual verdict. Absolute thresholds do
        // not work here: presenting *any* Kenyon code drives the
        // avoid-compartment MBONs several times harder than the approach
        // ones, so every object a naive fly ever saw read as far past a
        // fixed "dislike" line and nothing could ever read as liked.
        // Measured separation between a punished and an unpunished object
        // is about 2, with a spread of 0.3.
        const verdict = fly.mbEvoked - fly.mbVerdictMean;
        const dislikes =
          fly.mbFocusKey === ahead.key && verdict < -VERDICT_BAND;
        const likes = fly.mbFocusKey === ahead.key && verdict > VERDICT_BAND;

        if (dislikes && interesting) {
          /* eslint-disable no-param-reassign */
          fly.curiosityTarget = undefined;
          if (fly.state === FlyState.Walking && Math.random() < 0.6) {
            fly.heading += Math.PI * (0.6 + Math.random() * 0.4);
          }
          /* eslint-enable no-param-reassign */
          fly.memory.recordThreat(
            { x: ax, y: ay },
            { x: width, y: height },
            0.08
          );
        }

        // Curiosity is a maybe, not a rule — and each fly heads for its own
        // spot on the object, so several curious flies never converge on
        // one pixel.
        if (
          novelty > 0.6 &&
          interesting &&
          !dislikes &&
          !fly.curiosityTarget &&
          fly.homingTimer === 0 &&
          fly.scareCooldown === 0 &&
          (fly.state === FlyState.Walking || fly.state === FlyState.Idle) &&
          Math.random() < (likes ? 0.75 : 0.45)
        ) {
          const px =
            ahead.rect.left +
            ahead.rect.width * (0.2 + Math.random() * 0.6) -
            width / 2;
          const py =
            height / 2 -
            (ahead.rect.top + ahead.rect.height * (0.2 + Math.random() * 0.6));

          if (Math.hypot(px - fly.pos.x, py - fly.pos.y) < 320) {
            fly.investigate({ x: px, y: py });
          }
        }
      }

      // Phototaxis: compare brightness ahead-left against ahead-right.
      // Strength is an individual trait, so a bright patch draws some flies
      // and leaves others cold.
      const lookLx = sx + Math.cos(fly.heading + 0.6) * 90;
      const lookLy = sy - Math.sin(fly.heading + 0.6) * 90;
      const lookRx = sx + Math.cos(fly.heading - 0.6) * 90;
      const lookRy = sy - Math.sin(fly.heading - 0.6) * 90;
      const brightL = this.eye.brightnessAt(lookLx, lookLy);
      const brightR = this.eye.brightnessAt(lookRx, lookRy);
      let steer = 0;

      if (brightL !== undefined && brightR !== undefined) {
        steer = (brightL - brightR) * 0.8 * fly.phenotype.photoPref;
        // A drowsy fly seeks the dark instead — its own pre-nap state, not
        // the desk's. Keyed on the shared idle flag this flipped every
        // wide-awake fly to dark-seeking at once while a midday drowsy fly
        // still steered into the light.
        if (fly.drowsy) steer = -steer;
      }
      // eslint-disable-next-line no-param-reassign
      fly.lightSteer = Math.min(Math.max(steer, -0.6), 0.6);
    });
  }

  private pollTerrain(nowMs: number): void {
    const { height, width } = this.frame;
    const { ledges, rects } = senseTerrain(width, height);

    this.terrain = ledgesToScene(ledges, width, height);

    // Window boxes in scene coordinates, with velocities from the last poll.
    // A dragged window becomes a moving object every fly can see coming.
    const pollDt = Math.max((nowMs - this.lastTerrainMs) / 1000, 0.05);
    const currentIds = new Set<number>();
    const nextPos = new Map<number, { t: number; x: number; y: number }>();

    this.movingRects = rects.map(({ bottom, id, left, right, top }) => {
      const cx = (left + right) / 2 - width / 2;
      const cy = height / 2 - (top + bottom) / 2;
      const prev = this.prevRectPos.get(id);
      const vx = prev ? (cx - prev.x) / pollDt : 0;
      const vy = prev ? (cy - prev.y) / pollDt : 0;

      currentIds.add(id);
      nextPos.set(id, { t: nowMs, x: cx, y: cy });

      // An appearing window is an object popping into existence: startle the
      // flies near it, weighted by each one's own eyes — and habituated by
      // each one's memory of this particular window.
      if (!prev && this.terrainPolled && !this.knownWindowIds.has(id)) {
        this.startleAt({ x: cx, y: cy }, `window-${id}`);
      }

      return {
        id,
        vx,
        vy,
        x0: left - width / 2,
        x1: right - width / 2,
        y0: height / 2 - bottom,
        y1: height / 2 - top,
      };
    });

    // Sheep are moving objects too: a trotting (or falling) eSheep looms at
    // any fly it bears down on, exactly like a dragged window.
    senseSheep().forEach(({ id, rect }) => {
      const cx = (rect.left + rect.right) / 2 - width / 2;
      const cy = height / 2 - (rect.top + rect.bottom) / 2;
      const prev = this.prevRectPos.get(id);
      const vx = prev ? (cx - prev.x) / pollDt : 0;
      const vy = prev ? (cy - prev.y) / pollDt : 0;

      currentIds.add(id);
      nextPos.set(id, { t: nowMs, x: cx, y: cy });

      if (!prev && this.terrainPolled && !this.knownWindowIds.has(id)) {
        this.startleAt({ x: cx, y: cy }, `sheep-${id}`);
      }

      this.movingRects.push({
        id,
        vx,
        vy,
        x0: rect.left - width / 2,
        x1: rect.right - width / 2,
        y0: height / 2 - rect.bottom,
        y1: height / 2 - rect.top,
      });
    });
    this.prevRectPos = nextPos;
    this.knownWindowIds = currentIds;
    this.terrainPolled = true;

    // What is audible right now, as substrate vibration sources.
    this.soundScene = senseSound().map(({ intensity, x, y }) => ({
      intensity,
      x: x - width / 2,
      y: height / 2 - y,
    }));

    // The context menu is a pop-up too — it appears right under the cursor,
    // usually near whatever the user is about to disturb.
    const menu = document.querySelector(CONTEXT_MENU_SELECTOR);
    const menuOpen = menu instanceof HTMLElement && menu.offsetHeight > 0;

    if (menuOpen && !this.menuWasOpen) {
      const { left, right, top, bottom } = menu.getBoundingClientRect();

      this.startleAt(
        {
          x: (left + right) / 2 - width / 2,
          y: height / 2 - (top + bottom) / 2,
        },
        "context-menu"
      );
    }
    this.menuWasOpen = menuOpen;
  }

  /**
   * Deliver an appearance startle to every fly, through its own eyes. When
   * the event has an identity, each fly's familiarity with it damps the
   * pulse: the tenth appearance of the same window is barely news.
   */
  private startleAt(at: Point, key?: string): void {
    this.flies.forEach((fly, i) => {
      const novelty = key ? fly.memory.observe(key, "appearance", key, at) : 1;
      const pulse = appearanceThreat(
        fly.pos,
        fly.heading,
        at,
        0.55 * (0.3 + 0.7 * novelty)
      );

      if (threatLevel(pulse) > 0.01) addThreat(this.pulses[i], pulse);
    });
  }

  private pollAmbient(): void {
    this.eye.refresh(this.container);
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;

    this.hour = hour;
    this.circadian = circadianActivity(hour);

    const idle = this.activity.idleFor();

    // Night plus a long idle, or a very long idle at any hour.
    this.sleepy = (idle > 600 && !(hour >= 6 && hour < 22)) || idle > 1800;
  }

  /**
   * One frame of sensing for every fly: threats, memory, mushroom-body
   * bookkeeping, and the per-fly brain inputs. Inputs and queued
   * stimulations ship to the brain worker whenever it can take another
   * batch; the commands the bodies run on are the worker's latest reply,
   * refreshed each frame with the coordinator's clock and sleep signals.
   */
  private senseFrame(dt: number): void {
    // Shared cursor kinematics, smoothed like gnat's compute_loom.
    if (this.mouse && this.prevMouse && dt > 0) {
      const vx = (this.mouse.x - this.prevMouse.x) / dt;
      const vy = (this.mouse.y - this.prevMouse.y) / dt;

      this.mouseVel.x += (vx - this.mouseVel.x) * 0.4;
      this.mouseVel.y += (vy - this.mouseVel.y) * 0.4;
    }
    if (this.mouse) {
      if (this.prevMouse) {
        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;
      } else {
        this.prevMouse = { ...this.mouse };
      }
    }

    let click: Point | undefined;

    if (this.clickClient) {
      const [x, y] = toScene(
        this.frame,
        this.clickClient.x,
        this.clickClient.y
      );

      click = { x, y };
      this.clickClient = undefined;
    }

    this.loomOverride = Math.max(this.loomOverride - dt * 1.2, 0);

    const pulseDecay = Math.exp(-PULSE_DECAY * dt);
    const vibration = this.activity.vibration();
    const { bounds } = this;

    this.flies.forEach((fly, i) => {
      // What this fly sees and feels this frame, from where it stands.
      const threat = this.threatScratch;

      threat.loomL = 0;
      threat.loomR = 0;
      threat.puff = 0;

      if (this.mouse) {
        addThreat(
          threat,
          cursorThreat(fly.pos, fly.heading, this.mouse, this.mouseVel)
        );
      }
      this.movingRects.forEach((rect) => {
        // The window it stands on is ground, not threat.
        if (rect.id !== fly.ledge?.id) {
          addThreat(threat, rectThreat(fly.pos, fly.heading, rect));
        }
      });
      const caught = fly.state === FlyState.Caught;
      let touched = false;

      if (click && !caught) {
        const swat = tapThreat(fly.pos, fly.heading, click);

        if (threatLevel(swat) > 0.01) addThreat(this.pulses[i], swat);
        // Clicking (nearly) on the fly is physical contact: mechanosensation
        // reaches the giant fibre directly, and a touched fly always jumps.
        touched = isContact(fly.pos, click);
      }

      // Fading pulses: taps, pop-ups, neighbour takeoffs.
      const pulse = this.pulses[i];

      addThreat(threat, pulse);
      pulse.loomL *= pulseDecay;
      pulse.loomR *= pulseDecay;
      pulse.puff *= pulseDecay;

      threat.loomL = Math.min(threat.loomL + this.loomOverride, 1);
      threat.loomR = Math.min(threat.loomR + this.loomOverride, 1);

      // A fly held under the pointer is saturated with threat: every channel
      // maxed, so a connectome fly's circuits scream the whole time.
      if (caught) {
        threat.loomL = 1;
        threat.loomR = 1;
        threat.puff = 1;
      }

      // Hearing the desktop: playing media throbs through the substrate.
      // Each fly feels it on its own slow rhythm (keyed to its own clock),
      // gets restless near it, and remembers loud places as bad places.
      let hum = 0;

      this.soundScene.forEach(({ intensity, x, y }) => {
        const d = Math.hypot(x - fly.pos.x, y - fly.pos.y);

        hum += intensity * Math.max(1 - d / 420, 0);
      });
      if (hum > 0) {
        hum = Math.min(hum, 1) * (0.55 + 0.45 * Math.sin(fly.time * 4.4));
        threat.puff = Math.min(threat.puff + hum * 0.35, 1);
        if (hum > 0.5) {
          fly.memory.recordThreat(fly.pos, bounds, hum * dt * 0.4);
        }
      }

      // Places where bad things happen are remembered as bad places, and
      // uneventful ground slowly becomes remembered-safe ground.
      const level = threatLevel(threat);

      if (level > 0.3) {
        fly.memory.recordThreat(fly.pos, bounds, level * dt * 1.5);
      } else if (fly.state !== FlyState.Flying) {
        fly.memory.recordCalm(fly.pos, bounds, dt);
      }

      // Bolder individuals perceive the same loom as smaller and flee later.
      const loomGain =
        Math.min(Math.max(2 - fly.phenotype.boldness, 0.7), 1.25) *
        // A fly that has just been in a fist reads every shape as worse.
        (1 + 0.35 * fly.agitation);

      const inputs = this.inputsList[i];

      inputs.loomL = Math.min(threat.loomL * loomGain, 1);
      inputs.loomR = Math.min(threat.loomR * loomGain, 1);
      inputs.airPuff = Math.max(threat.puff, vibration * 0.3);
      // Body back into brain: leg proprioception from this fly's own gait.
      inputs.gaitDrive = fly.walkingIntensity();
      inputs.gaitPhase = fly.gaitPhase;
      // Circadian and sleep neuromodulation, compressed toward 1. The LIF
      // neurons sit just below threshold, so a raw multiplier silences them
      // outright: a siesta should mean "less active", not comatose. Each
      // fly runs on its own chronotype-shifted clock, vigor, and drowsiness.
      const circadian = circadianActivity(
        (this.hour - fly.phenotype.chronotype + 24) % 24
      );

      inputs.activityScale =
        (1 - (1 - circadian) * 0.35) *
        (this.sleepy ? 0.75 : 1) *
        (0.9 + 0.1 * fly.phenotype.vigor) *
        (fly.drowsy ? 0.88 : 1);
      // A sleeping fly's raised arousal threshold — one of the four
      // criteria that define sleep, and the one this sim was missing: its
      // looms hit the circuit at full gain whether it was asleep or not.
      // Depth builds as the fly settles (restDepth) and deepens over the
      // first minutes of the bout, as measured arousal thresholds do.
      // Calibrated by sweeping gate against loom strength: at 0.4 a weak
      // loom that always rouses a waking fly rouses a deep sleeper 0 times
      // in 30, while a strong one still fires the giant fibre every time —
      // at double the latency, which is how a woken animal actually moves.
      // Touch is mechanosensory and bypasses this gate entirely.
      const sleepDepth =
        fly.state === FlyState.Sleeping
          ? fly.restDepth * (0.5 + 0.5 * Math.min(fly.stateAge / 240, 1))
          : 0;

      // A raised sensory threshold is a property of SLEEP, not of a quiet
      // desk: the old shared 0.55 idle gate left every wide-awake fly
      // half-deaf to looms at 3 a.m. The only gate is each fly's own.
      inputs.sensoryGate = 1 - 0.6 * sleepDepth;
      // Body turning into the compass circuit's PEN shifters.
      inputs.rotation = fly.headingRate;

      // What the LC11 small-object pathway sees from this fly's position:
      // other flies, sheep, and the cursor moving at a distance.
      let smallL = 0;
      let smallR = 0;

      if (this.mouse) {
        const [l, r] = smallObjectDrive(
          fly.pos,
          fly.heading,
          this.mouse,
          Math.hypot(this.mouseVel.x, this.mouseVel.y),
          140,
          460
        );

        smallL += l;
        smallR += r;
      }
      this.flies.forEach((other, j) => {
        if (j !== i) {
          const speed =
            other.state === FlyState.Flying
              ? FLIGHT_SPEED_PX_S
              : Math.abs(other.speed);
          const [l, r] = smallObjectDrive(
            fly.pos,
            fly.heading,
            other.pos,
            speed,
            30,
            320
          );

          smallL += l;
          smallR += r;
        }
      });
      this.movingRects.forEach((rect) => {
        if (rect.id >= SHEEP_ID_BASE) {
          const [l, r] = smallObjectDrive(
            fly.pos,
            fly.heading,
            { x: (rect.x0 + rect.x1) / 2, y: (rect.y0 + rect.y1) / 2 },
            Math.hypot(rect.vx, rect.vy),
            40,
            380
          );

          smallL += l;
          smallR += r;
        }
      });
      inputs.smallObjL = Math.min(smallL, 1);
      inputs.smallObjR = Math.min(smallR, 1);

      // Dopamine: a bad moment while looking at something teaches its KC
      // code as aversive; a calm, content moment teaches it as appetitive.
      const focusFresh =
        fly.mbFocusKey !== undefined &&
        performance.now() - fly.mbFocusMs < 1200;

      /* eslint-disable no-param-reassign */
      if (focusFresh && fly.mbPulseCooldown === 0) {
        if (level > 0.5 || touched) {
          this.pendingStims.push({
            durationMs: 250,
            group: "ppl1",
            index: i,
            strength: 0.2,
          });
          fly.mbPulseCooldown = 1.2;
        } else if (
          level < 0.1 &&
          (fly.state === FlyState.Grooming || fly.tasteTimer > 0) &&
          Math.random() < 0.5 * dt
        ) {
          this.pendingStims.push({
            durationMs: 250,
            group: "pam",
            index: i,
            strength: 0.15,
          });
          fly.mbPulseCooldown = 1.5;
        }
      }
      /* eslint-enable no-param-reassign */

      // A hard tap also travels through the substrate into the wind-sensing
      // pathway, like gnat's focus-change tap — but only for flies near it.
      if (click && threat.puff > 0.3) {
        this.pendingStims.push({
          durationMs: 130,
          group: "sens",
          index: i,
          strength: 0.2,
        });
      }
      // Physical contact drives the giant fibre through the mechanosensory
      // pathway: a poked fly escapes through its real command neuron.
      if (touched && fly.scareCooldown === 0) {
        this.pendingStims.push({
          durationMs: 30,
          group: "gf",
          index: i,
          strength: 0.6,
        });
      }

      // The latest commands from the worker; clock and sleep are the
      // coordinator's to refresh every frame.
      const made = this.signals[i];

      made.clock = circadian;
      // Sleep is the shared quiet-desk signal or this fly's own homeostat.
      made.sleep = this.sleepy || fly.drowsy;

      // MBON valence: how this object feels *compared with the other things
      // this fly looks at*.
      //
      // The baseline has to be the fly's typical response to a presentation,
      // not its response to silence. Driving any Kenyon-cell code at all
      // excites the avoid-compartment MBONs far harder than the approach
      // ones — 44 Hz against 13 Hz, a property of the wiring — so measuring
      // a presentation against rest returns about -30 for every object a
      // naive fly has ever seen. Against a -0.35 "turn away" threshold that
      // meant the fly disliked everything on sight and could never come to
      // like anything, with learning computed and behaviourally inert.
      //
      // Relative valence also gives extinction for free: keep looking at a
      // punished icon without being punished again and the baseline
      // eventually catches up, which is what happens to a real fly.
      const diff = made.mbApproach - made.mbAvoid;

      /* eslint-disable no-param-reassign */
      if (focusFresh) {
        fly.mbSeen += dt;

        // The baseline adapts fast at first and then settles: a fly with no
        // experience has no opinion, so its first couple of seconds of
        // looking at anything *establish* what neutral feels like, and only
        // after that does a deviation mean something. Seeding from a single
        // frame does not work — the readout has not risen yet.
        const tau = Math.min(0.5 + fly.mbSeen, 120);

        if (fly.mbSeen > 2) {
          // Averaged over seconds, not tracked instantly: the Kenyon code is
          // re-presented every third of a second and decays between, so a
          // fast tracker just samples wherever it lands in that cycle.
          fly.mbEvoked +=
            (diff - fly.mbBaseline - fly.mbEvoked) * Math.min(dt / 3, 1);
          fly.mbVerdictMean +=
            (fly.mbEvoked - fly.mbVerdictMean) * Math.min(dt / 90, 1);
        }
        fly.mbBaseline += (diff - fly.mbBaseline) * Math.min(dt / tau, 1);
      }
      /* eslint-enable no-param-reassign */
    });

    // Ship the batch. dt accumulates across frames the worker missed, so
    // biological time stays honest; the worker steps it in whole ms. The
    // clamp stops the wait for worker startup becoming a fast-forward.
    this.pendingDt = Math.min(this.pendingDt + dt, 0.25);
    // A worker that never reports ready (a failed circuit fetch) is never
    // sent a batch, so the queue would grow for as long as the flies live;
    // the oldest stimulations are the ones worth dropping.
    if (this.pendingStims.length > MAX_PENDING_STIMS) {
      this.pendingStims.splice(0, this.pendingStims.length - MAX_PENDING_STIMS);
    }
    // A reply that never comes (a worker fault) must not freeze the brains
    // out forever; after a beat, offer the worker a fresh batch.
    if (this.brainBusy && performance.now() - this.brainSentMs > 2000) {
      this.brainBusy = false;
    }
    if (this.workerReady && !this.brainBusy && this.flies.length > 0) {
      this.worker.postMessage({
        dt: this.pendingDt,
        inputs: this.inputsList,
        roster: this.roster,
        stims: this.pendingStims,
        type: "frame",
      });
      this.brainBusy = true;
      this.brainSentMs = performance.now();
      this.pendingDt = 0;
      this.pendingStims.length = 0;
    }
  }
}

declare global {
  interface Window {
    /** Debug/e2e handle, like DEBUG_DEFAULT_SESSION. */
    DEBUG_FLY_APP?: FlyApp;
  }
}
