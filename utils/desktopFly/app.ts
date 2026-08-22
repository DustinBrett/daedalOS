// The coordinator: senses in, spikes in the middle, flies on the screen.
// The order inside a frame mirrors gnat's `app.rs` (MIT): sense the desktop,
// drive the circuits, step them in whole milliseconds, read the population
// rates as body commands, move the bodies, draw.
//
// Where gnat gave one fly the connectome and the rest a distance check, here
// every fly (up to a compute cap) carries its own 668-neuron simulation and
// its own eyes: each one sees the cursor, dragged windows, sudden pop-ups,
// and its neighbours' takeoffs from its own position and heading. That is
// what makes a group scatter from an approaching window the way real flies
// scatter from a hand.

import { Activity } from "utils/desktopFly/activity";
import { type Circuit } from "utils/desktopFly/circuit";
import { Fly, FlyState, type Point } from "utils/desktopFly/fly";
import { Lif } from "utils/desktopFly/lif";
import { drawFly, type Frame, toScene } from "utils/desktopFly/render";
import {
  type MovingRect,
  type Threat,
  addThreat,
  appearanceThreat,
  cursorThreat,
  isContact,
  rectThreat,
  takeoffStartle,
  tapThreat,
  threatLevel,
} from "utils/desktopFly/senses";
import {
  SignalBuilder,
  type Signals,
  circadianActivity,
} from "utils/desktopFly/signals";
import { ledgesToScene, senseTerrain } from "utils/desktopFly/terrain";
import { Rng } from "utils/desktopFly/rng";

/** How often the window list is re-read, in ms. DOM reads are cheap. */
const TERRAIN_INTERVAL = 150;
/** How often the clock and idle state are re-read, in ms. */
const AMBIENT_INTERVAL = 2000;
/** The sims can fall at most this far behind before frames are dropped. */
const MAX_STEPS_PER_FRAME = 50;
const MAX_FLIES = 24;
/**
 * Flies beyond this many share no brain and fall back to reflex heuristics.
 * One 1,275-neuron sim costs ~0.4 ms per 60 fps frame, so ten full
 * connectomes cost ~4 ms — inside a frame budget with room for rendering.
 */
const BRAIN_LIMIT = 10;
/** Per-second decay rate of transient threat pulses (taps, pop-ups). */
const PULSE_DECAY = 4.5;
/** Reflex flies flee when their combined threat passes this level. */
const REFLEX_FLEE_LEVEL = 0.5;

const FLY_CANVAS_ID = "desktop-fly";
const CONTEXT_MENU_SELECTOR = "#__next > nav";

const emptyThreat = (): Threat => ({ loomL: 0, loomR: 0, puff: 0 });

export class FlyApp {
  private readonly canvas: HTMLCanvasElement;

  private readonly ctx: CanvasRenderingContext2D;

  private readonly container: HTMLElement;

  private readonly circuit: Circuit;

  /** Per-fly connectome sims; `undefined` past BRAIN_LIMIT. */
  private brains: (Lif | undefined)[] = [];

  private builders: (SignalBuilder | undefined)[] = [];

  private flies: Fly[] = [];

  /** Per-fly transient threat pulses (taps, pop-ups, neighbour takeoffs). */
  private pulses: Threat[] = [];

  /** Where the latest pulse came from, so reflex flies can flee it. */
  private pulseFrom: (Point | undefined)[] = [];

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

  private msAccumulator = 0;

  private sleepy = false;

  private circadian = 1;

  private pokePending = false;

  private clickClient?: Point;

  private rafId = 0;

  private running = false;

  public constructor(circuit: Circuit, container: HTMLElement) {
    const seed = Math.floor(Date.now() / 256);

    this.circuit = circuit;
    this.nextSeed = seed;
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.id = FLY_CANVAS_ID;
    this.canvas.style.position = "absolute";
    this.canvas.style.inset = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "2000";
    container.append(this.canvas);

    const ctx = this.canvas.getContext("2d", { alpha: true });

    if (!ctx) throw new Error("desktop-fly: no 2d canvas context");

    this.ctx = ctx;
    this.resize();

    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    window.addEventListener("mousedown", this.onMouseDown, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", this.onKeyDown, {
      capture: true,
      passive: true,
    });
    window.DEBUG_FLY_APP = this;
  }

  private readonly onMouseMove = (event: MouseEvent): void => {
    this.mouseClient = { x: event.clientX, y: event.clientY };
    this.pokePending = true;
  };

  /** A click is a tap on the substrate — a swat, to any fly near it. */
  private readonly onMouseDown = (event: MouseEvent): void => {
    this.clickClient = { x: event.clientX, y: event.clientY };
    this.pokePending = true;
  };

  private readonly onKeyDown = (): void => {
    this.pokePending = true;
  };

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

    // Every fly up to the compute cap gets its own connectome — its own
    // seed, so no two brains crackle alike.
    const hasBrain = this.flies.length < BRAIN_LIMIT;

    this.flies.push(fly);
    this.brains.push(
      hasBrain ? new Lif(this.circuit, this.nextSeed) : undefined
    );
    this.builders.push(hasBrain ? new SignalBuilder() : undefined);
    this.pulses.push(emptyThreat());
    this.pulseFrom.push(undefined);
    this.wasFlying.push(false);
    if (!this.running) this.start();
  }

  /** Remove the most recently added fly. */
  public removeFly(): void {
    this.flies.pop();
    this.brains.pop();
    this.builders.pop();
    this.pulses.pop();
    this.pulseFrom.pop();
    this.wasFlying.pop();
    if (this.flies.length === 0) this.stop();
  }

  /** A deliberate scare: a real loom into every circuit at once. */
  public scare(): void {
    this.loomOverride = 0.6;

    const bounds: Point = { x: this.frame.width, y: this.frame.height };

    this.flies.forEach((fly, i) => {
      if (!this.brains[i] && fly.state !== FlyState.Flying) {
        fly.startFlight(bounds);
      }
    });
  }

  private start(): void {
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
    window.removeEventListener("keydown", this.onKeyDown, { capture: true });
    this.canvas.remove();
    this.flies = [];
    this.brains = [];
    this.builders = [];
    this.pulses = [];
    this.pulseFrom = [];
    this.wasFlying = [];
    window.DEBUG_FLY_APP = undefined;
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
  }

  private readonly onFrame = (nowMs: number): void => {
    if (!this.running) return;

    // Clamped: a stalled tab must not teleport the flies.
    const dt = Math.min(Math.max((nowMs - this.lastFrameMs) / 1000, 0), 0.05);

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
    if (this.mouseClient) {
      const [x, y] = toScene(
        this.frame,
        this.mouseClient.x,
        this.mouseClient.y
      );

      this.mouse = { x, y };
    }

    const signals = this.stepBrains(dt);
    const bounds: Point = { x: this.frame.width, y: this.frame.height };

    this.flies.forEach((fly, i) => {
      // eslint-disable-next-line no-param-reassign
      fly.terrain = this.terrain;
      fly.update(dt, bounds, this.mouse, signals[i]);
    });

    this.propagateTakeoffs();

    this.ctx.clearRect(0, 0, this.frame.width, this.frame.height);
    this.flies.forEach((fly) => drawFly(this.ctx, fly, this.frame));

    this.rafId = window.requestAnimationFrame(this.onFrame);
  };

  /** Escape contagion: a takeoff is sudden motion in every neighbour's eye. */
  private propagateTakeoffs(): void {
    this.flies.forEach((fly, i) => {
      const flying = fly.state === FlyState.Flying;

      if (flying && !this.wasFlying[i]) {
        this.flies.forEach((other, j) => {
          if (i === j) return;

          const pulse = takeoffStartle(other.pos, other.heading, fly.pos);

          if (threatLevel(pulse) > 0.01) {
            addThreat(this.pulses[j], pulse);
            this.pulseFrom[j] = { ...fly.pos };
          }
        });
      }
      this.wasFlying[i] = flying;
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
      // flies near it, weighted by each one's own eyes.
      if (!prev && this.terrainPolled && !this.knownWindowIds.has(id)) {
        this.startleAt({ x: cx, y: cy });
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
    this.prevRectPos = nextPos;
    this.knownWindowIds = currentIds;
    this.terrainPolled = true;

    // The context menu is a pop-up too — it appears right under the cursor,
    // usually near whatever the user is about to disturb.
    const menu = document.querySelector(CONTEXT_MENU_SELECTOR);
    const menuOpen = menu instanceof HTMLElement && menu.offsetHeight > 0;

    if (menuOpen && !this.menuWasOpen) {
      const { left, right, top, bottom } = menu.getBoundingClientRect();

      this.startleAt({
        x: (left + right) / 2 - width / 2,
        y: height / 2 - (top + bottom) / 2,
      });
    }
    this.menuWasOpen = menuOpen;
  }

  /** Deliver an appearance startle to every fly, through its own eyes. */
  private startleAt(at: Point): void {
    this.flies.forEach((fly, i) => {
      const pulse = appearanceThreat(fly.pos, fly.heading, at);

      if (threatLevel(pulse) > 0.01) {
        addThreat(this.pulses[i], pulse);
        this.pulseFrom[i] = { ...at };
      }
    });
  }

  private pollAmbient(): void {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;

    this.circadian = circadianActivity(hour);

    const idle = this.activity.idleFor();

    // Night plus a long idle, or a very long idle at any hour.
    this.sleepy = (idle > 600 && !(hour >= 6 && hour < 22)) || idle > 1800;
  }

  /**
   * One frame of sensing and simulation for every fly. Returns per-fly body
   * commands; `undefined` for reflex flies past the brain cap.
   */
  private stepBrains(dt: number): (Signals | undefined)[] {
    // Shared cursor kinematics, smoothed like gnat's compute_loom.
    if (this.mouse && this.prevMouse && dt > 0) {
      const vx = (this.mouse.x - this.prevMouse.x) / dt;
      const vy = (this.mouse.y - this.prevMouse.y) / dt;

      this.mouseVel.x += (vx - this.mouseVel.x) * 0.4;
      this.mouseVel.y += (vy - this.mouseVel.y) * 0.4;
    }
    if (this.mouse) this.prevMouse = { ...this.mouse };

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
    const activityScale =
      (1 - (1 - this.circadian) * 0.35) * (this.sleepy ? 0.75 : 1);
    const sensoryGate = this.sleepy ? 0.55 : 1;
    const vibration = this.activity.vibration();

    // Step in whole milliseconds, carrying the remainder, so the 1 kHz
    // internal rate stays honest regardless of frame pacing. One shared
    // accumulator: every brain steps the same amount of biological time.
    this.msAccumulator += dt * 1000;

    const steps = Math.min(Math.floor(this.msAccumulator), MAX_STEPS_PER_FRAME);

    this.msAccumulator -= steps;

    const bounds: Point = { x: this.frame.width, y: this.frame.height };

    return this.flies.map((fly, i) => {
      // What this fly sees and feels this frame, from where it stands.
      const threat = emptyThreat();

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
      let touched = false;

      if (click) {
        const swat = tapThreat(fly.pos, fly.heading, click);

        if (threatLevel(swat) > 0.01) {
          addThreat(this.pulses[i], swat);
          this.pulseFrom[i] = { ...click };
        }
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

      const brain = this.brains[i];
      const builder = this.builders[i];

      if (!brain || !builder) {
        // Reflex flies: no circuit, but the same senses. Enough combined
        // threat and they flee it, cooldown-gated like the legacy fear.
        // Being touched overrides the cooldown: contact always launches.
        if (
          (touched ||
            (threatLevel(threat) > REFLEX_FLEE_LEVEL &&
              fly.scareCooldown === 0)) &&
          fly.state !== FlyState.Flying
        ) {
          fly.startFlight(bounds, this.pulseFrom[i] ?? this.mouse, touched);
        }

        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      }

      const { inputs } = brain;

      inputs.loomL = threat.loomL;
      inputs.loomR = threat.loomR;
      inputs.airPuff = Math.max(threat.puff, vibration * 0.3);
      // Body back into brain: leg proprioception from this fly's own gait.
      inputs.gaitDrive = fly.walkingIntensity();
      inputs.gaitPhase = fly.gaitPhase;
      // Circadian and sleep neuromodulation, compressed toward 1. The LIF
      // neurons sit just below threshold, so a raw multiplier silences them
      // outright: a siesta should mean "less active", not comatose.
      inputs.activityScale = activityScale;
      inputs.sensoryGate = sensoryGate;

      // A hard tap also travels through the substrate into the wind-sensing
      // pathway, like gnat's focus-change tap — but only for flies near it.
      if (click && threat.puff > 0.3) {
        brain.stimulate(brain.getGroups().sens, 0.2, 130);
      }
      // Physical contact drives the giant fibre through the mechanosensory
      // pathway: a poked fly escapes through its real command neuron.
      if (touched && fly.scareCooldown === 0) {
        brain.stimulate(brain.getGroups().gf, 0.6, 30);
      }

      brain.step(steps);

      return {
        ...builder.make(brain, dt),
        sleep: this.sleepy,
        tempo: 1,
      };
    });
  }
}

declare global {
  interface Window {
    /** Debug/e2e handle, like DEBUG_DEFAULT_SESSION. */
    DEBUG_FLY_APP?: FlyApp;
  }
}
