/* eslint-disable no-param-reassign */
// The fly's body and behaviour: position, scale, height, leg angles, wing
// angles, driven by the connectome's population rates (or by legacy
// distance-based fear for extra brainless flies). Ported from gnat's `fly.rs`
// / DesktopFly's `FlyModel.swift` (MIT).
//
// Coordinates are the original's scene frame: origin at the centre of the
// output, +y up. Converting to screen space is the renderer's job.

import { Rng } from "utils/desktopFly/rng";
import { type Signals } from "utils/desktopFly/signals";

/** Rendered size of the fly at ground level. */
const FLY_SCALE = 1.15;
/** How far from the edge of the output a flight target may land. */
const EDGE_MARGIN = 50;
/** Legacy (non-connectome) fear radii, used only when there are no signals. */
const SCARE_RADIUS = 110;
const NERVOUS_RADIUS = 240;

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

/** A walkable window top edge, in scene coordinates. */
export type Ledge = {
  /** Stable identity of the window this edge belongs to. */
  id: number;
  x0: number;
  x1: number;
  y: number;
};

export const FlyState = {
  Flying: 3,
  Grooming: 2,
  Idle: 1,
  Sleeping: 4,
  Walking: 0,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FlyState = (typeof FlyState)[keyof typeof FlyState];

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

  /** Height above the surface, in scene units. */
  public z = 0;

  /** Abdomen breathing multiplier, slower and deeper while asleep. */
  public breath = 1;

  public legs: Leg[];

  /** Left wing then right wing. */
  public wings: Wing[];

  private brainLive = false;

  private liveArousal = 0;

  private liveWing = 0;

  private readonly rng: Rng;

  public constructor(at: Point, seed: number) {
    const rng = new Rng(seed);

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
      ? clamp(Math.abs(this.effectiveSpeed()) / 60, 0, 1)
      : 0;
  }

  private effectiveSpeed(): number {
    return this.backwardTimer > 0 ? -22 : this.speed;
  }

  public startFlight(
    bounds: Point,
    awayFrom?: Point,
    escape?: boolean,
    effort?: number
  ): void {
    this.state = FlyState.Flying;
    this.ledge = undefined;
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
      this.rng.float() < 0.45
    ) {
      const ledge = this.terrain[this.rng.rangeInt(0, this.terrain.length - 1)];

      if (ledge.x1 - ledge.x0 > 90) {
        target = {
          x: this.rng.range(ledge.x0 + 25, ledge.x1 - 25),
          y: ledge.y,
        };
        chosen = Math.hypot(target.x - this.pos.x, target.y - this.pos.y) > 180;
      }
    }
    if (!chosen) {
      for (let attempt = 0; attempt < 16; attempt += 1) {
        target = { x: this.rng.range(-hw, hw), y: this.rng.range(-hh, hh) };

        const far =
          Math.hypot(target.x - this.pos.x, target.y - this.pos.y) >
          (escape ? 350 : 260);

        if (far) {
          // Escaping means landing on the far side of the fly from the
          // threat, not merely somewhere distant.
          const fleeing =
            !awayFrom ||
            (target.x - this.pos.x) * (awayFrom.x - this.pos.x) +
              (target.y - this.pos.y) * (awayFrom.y - this.pos.y) <=
              0;

          if (fleeing) break;
        }
      }
    }

    this.flightTo = target;

    const dist = Math.hypot(target.x - this.pos.x, target.y - this.pos.y);

    this.flightDur = escape
      ? clamp(dist / 650, 0.45, 1.2)
      : clamp(dist / 420, 0.7, 2);
    this.flightT = 0;
    this.scareCooldown = escape ? 2 : 2.5;
  }

  private land(): void {
    this.state = FlyState.Idle;
    this.stateTimer = this.rng.range(0.3, 0.8);
    this.speed = 0;
    this.alt = 0;
    this.pitch = 0;
    this.scale = FLY_SCALE;
    this.z = 0;
    // Refold the wings flat over the abdomen.
    this.wings = [
      { x: 0, y: 0, z: -0.13 },
      { x: 0, y: 0, z: 0.13 },
    ];
  }

  private pickNextState(): void {
    switch (this.state) {
      case FlyState.Walking: {
        const r = this.rng.float();

        if (r < 0.3) {
          this.state = FlyState.Idle;
          this.stateTimer = this.rng.range(0.8, 3);
          this.speed = 0;
        } else if (r < 0.55) {
          this.stateTimer = this.rng.range(0.3, 0.8);
          this.speed = this.rng.range(95, 150);
          this.heading += this.rng.range(-1.2, 1.2);
        } else {
          this.stateTimer = this.rng.range(1.5, 5);
          this.speed = this.rng.range(18, 45);
        }
        break;
      }
      case FlyState.Idle:
        if (this.rng.float() < 0.35) {
          this.state = FlyState.Grooming;
          this.stateTimer = this.rng.range(1, 2.5);
        } else {
          this.state = FlyState.Walking;
          this.stateTimer = this.rng.range(1.5, 5);
          this.speed = this.rng.range(18, 45);
          this.heading += this.rng.range(-1.5, 1.5);
        }
        break;

      case FlyState.Grooming:
        this.state = FlyState.Idle;
        this.stateTimer = this.rng.range(0.3, 1);
        break;
      default:
        break;
    }
  }

  private setState(state: FlyState): void {
    if (state === this.state) return;

    this.state = state;
    this.stateAge = 0;
  }

  public update(
    dt: number,
    bounds: Point,
    mouse?: Point,
    signals?: Signals
  ): void {
    this.time += dt;
    this.scareCooldown = Math.max(this.scareCooldown - dt, 0);
    this.dartCooldown = Math.max(this.dartCooldown - dt, 0);
    this.backwardTimer = Math.max(this.backwardTimer - dt, 0);
    this.stateAge += dt;
    this.dartTimer = Math.max(this.dartTimer - dt, 0);

    // Live brain drives reach the wings even mid-flight.
    this.brainLive = Boolean(signals);
    this.liveArousal = signals?.arousal ?? 0;
    this.liveWing = signals?.wingDrive ?? 0;

    if (this.state === FlyState.Flying) {
      this.updateFlight(dt);
    } else if (signals) {
      this.brainBehavior(signals, dt, bounds, mouse);
      if (this.state === FlyState.Walking) this.updateWalk(dt, bounds);
    } else {
      this.legacyBehavior(dt, bounds, mouse);
    }

    this.updateLegs(dt);
    this.updateWings(dt);
    // Slower, deeper breathing while asleep.
    this.breath =
      this.state === FlyState.Sleeping
        ? 1 + 0.05 * Math.sin(this.time * 1.1)
        : 1 + 0.03 * Math.sin(this.time * 3);
  }

  /** Mouse-distance fear, for extra flies that have no brain of their own. */
  private legacyBehavior(dt: number, bounds: Point, mouse?: Point): void {
    if (this.scareCooldown === 0 && mouse) {
      const d = Math.hypot(mouse.x - this.pos.x, mouse.y - this.pos.y);

      if (d < SCARE_RADIUS) {
        this.startFlight(bounds, mouse, false);
      } else if (d < NERVOUS_RADIUS && this.state !== FlyState.Walking) {
        this.setState(FlyState.Walking);
        this.heading =
          Math.atan2(this.pos.y - mouse.y, this.pos.x - mouse.x) +
          this.rng.range(-0.4, 0.4);
        this.speed = this.rng.range(110, 150);
        this.stateTimer = this.rng.range(0.4, 0.9);
        this.scareCooldown = 1;
      }
    }
    if (this.state !== FlyState.Flying) {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.state === FlyState.Walking && this.rng.float() < 0.1) {
          this.startFlight(bounds);
        } else {
          this.pickNextState();
        }
      }
      if (this.state === FlyState.Walking) this.updateWalk(dt, bounds);
    }
  }

  /** Every decision here reads a real neuron population's rate. */
  private brainBehavior(
    s: Signals,
    dt: number,
    bounds: Point,
    mouse?: Point
  ): void {
    // Giant fibre spike: escape takeoff, even out of sleep.
    if (s.escape && this.scareCooldown === 0) {
      this.startFlight(bounds, mouse, true);

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
    // Looming detectors hot but the giant fibre quiet: a nervous dart rather
    // than a full takeoff.
    if (s.nervous > 0.4 && this.dartCooldown === 0) {
      this.ledge = undefined;
      this.setState(FlyState.Walking);
      this.heading = mouse
        ? Math.atan2(this.pos.y - mouse.y, this.pos.x - mouse.x) +
          this.rng.range(-0.4, 0.4)
        : this.heading + this.rng.range(-1.5, 1.5);
      this.speed = this.rng.range(110, 155);
      this.dartTimer = this.rng.range(0.4, 0.9);
      this.dartCooldown = 1.2;
    }
    // DNg11 grooming command, with hysteresis so it does not chatter.
    if (this.state !== FlyState.Walking || this.dartTimer === 0) {
      if (
        this.state !== FlyState.Grooming &&
        s.groomDrive > 0.5 &&
        s.nervous < 0.3 &&
        this.stateAge > 0.4
      ) {
        this.setState(FlyState.Grooming);
      } else if (
        this.state === FlyState.Grooming &&
        s.groomDrive < 0.3 &&
        this.stateAge > 0.6
      ) {
        this.setState(FlyState.Idle);
      }
    }
    // DNp09 forward-walking command, likewise hysteretic.
    if (
      this.state === FlyState.Idle &&
      s.walkDrive > 0.22 &&
      this.stateAge > 0.4
    ) {
      this.setState(FlyState.Walking);
      this.heading += this.rng.range(-0.8, 0.8);
    } else if (
      this.state === FlyState.Walking &&
      this.dartTimer === 0 &&
      s.walkDrive < 0.08 &&
      this.stateAge > 0.5
    ) {
      this.setState(FlyState.Idle);
      this.speed = 0;
    }
    // An MDN burst reverses the fly from any grounded state.
    if (s.backward && this.backwardTimer === 0 && this.dartTimer === 0) {
      if (this.state !== FlyState.Walking) {
        this.setState(FlyState.Walking);
        this.speed = 0;
      }
      this.backwardTimer = 0.5;
    }
    // Walking speed follows the forward command; tempo is temperature.
    if (this.state === FlyState.Walking) {
      if (this.dartTimer === 0 && this.backwardTimer === 0) {
        const target = (14 + s.walkDrive * 55) * s.tempo;

        this.speed += (target - this.speed) * Math.min(3 * dt, 1);
      }
      if (!this.ledge) {
        // DNa01/DNa02 steering.
        this.heading += s.turnBias * dt;
      }
    }
    // Spontaneous takeoff, gated on whole-population arousal. Flight effort
    // scales with how aroused the network is.
    const flightChance = s.arousal > 0.5 ? 0.6 : 0.005;

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
      this.heading += this.rng.range(-1, 1) * 1.6 * dt;

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
  }

  private applyAltitude(): void {
    this.scale = FLY_SCALE * (1 + 0.8 * this.alt);
    this.z = 90 * this.alt;
  }

  private updateFlight(dt: number): void {
    this.flightT = Math.min(this.flightT + dt / this.flightDur, 1);
    if (this.flightT >= 1) {
      // Touchdown flare: hover over the target and settle.
      this.pos.x = this.flightTo.x + Math.sin(this.time * 26) * 1.2;
      this.pos.y = this.flightTo.y + Math.cos(this.time * 22);
      this.pitch = clamp(this.alt * 0.4, 0, 0.35);
      this.alt += (0 - this.alt) * Math.min(9 * dt, 1);
      this.applyAltitude();
      if (this.alt < 0.035) {
        this.pos = { ...this.flightTo };
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
    const wob = Math.sin(this.time * 32) * 4 * Math.sin(this.flightT * PI);

    this.pos.x = this.flightFrom.x + dx * e + px * wob;
    this.pos.y = this.flightFrom.y + dy * e + py * wob;
    this.heading = Math.atan2(dy, dx) + Math.sin(this.time * 18) * 0.12;

    // Effort stays live: ongoing escape-DN and arousal activity make the fly
    // beat harder and climb higher part-way through a flight.
    this.effortCurrent = this.brainLive
      ? clamp(
          Math.max(
            this.flightEffort,
            this.flightEffort * 0.55 +
              this.liveArousal * 0.25 +
              this.liveWing * 0.6
          ),
          0.25,
          1.3
        )
      : this.flightEffort;

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
      const amp = clamp(0.2 + v * 0.0022, 0.2, 0.5);
      const stride = Math.max(2 * amp * 13, 5);
      const freq = clamp(v / stride, 3, 11);

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
      this.legs.forEach((leg) => {
        if (leg.isFront) {
          leg.angle =
            0.45 + 0.25 * Math.sin(this.time * 20 + leg.swingSign * 1.3);
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
    } else {
      this.legs.forEach((leg) => {
        leg.angle += (0 - leg.angle) * Math.min(10 * dt, 1);
        leg.lift += (0 - leg.lift) * Math.min(10 * dt, 1);
      });
    }
  }

  private updateWings(dt: number): void {
    if (this.state !== FlyState.Flying) {
      // Grounded threat posture: escape-DN or loom activity raises the wings
      // without taking off.
      const raiseTarget =
        this.state !== FlyState.Sleeping &&
        (this.liveWing > 0.7 || (this.brainLive && this.dartTimer > 0))
          ? 1
          : 0;

      this.wingRaise += (raiseTarget - this.wingRaise) * Math.min(8 * dt, 1);
      if (this.wingRaise > 0.01) {
        const raise = this.wingRaise;

        this.wings = [-1, 1].map((side) => ({
          x: -0.5 * raise,
          y: 0,
          z: side * (0.13 + 0.3 * raise),
        }));
      }

      return;
    }

    // Visible wing beat: the stroke arc sweeps faster at higher effort.
    this.flapPhase = (this.flapPhase + dt * (14 + 10 * this.effortCurrent)) % 1;

    const stroke = Math.sin(this.flapPhase * TWO_PI);

    this.wings = [-1, 1].map((side) => ({
      x: stroke * 0.35,
      y: 0,
      z: side * (0.45 + 0.35 * (0.5 + 0.5 * stroke)),
    }));
  }
}
