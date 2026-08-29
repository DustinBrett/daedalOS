// Working memory for one fly, alive only while the instance runs (nothing is
// persisted). Two stores, loosely modelled on the mushroom body's role in
// valence learning:
//
// - A coarse spatial valence map over the screen: places where the fly was
//   threatened accumulate danger, places where it stood undisturbed
//   accumulate comfort. Both decay, so a bad corner is eventually forgiven.
//   Flight targeting reads this map to prefer remembered-safe ground.
// - An object memory: things the fly has looked at (icons, windows, sheep,
//   the wallpaper), keyed by identity. Repeated exposure builds familiarity,
//   which habituates startle (the tenth pop-up of the same window is old
//   news) and kills curiosity (a novel object is worth walking toward).

import { type Point } from "utils/desktopFly/fly";

const COLS = 12;
const ROWS = 7;
/** Danger decays with a ~70 s time constant, comfort with ~150 s. */
const DANGER_DECAY_TAU = 70;
const COMFORT_DECAY_TAU = 150;
/** Familiarity fades with a ~2 min time constant between sightings. */
const FAMILIARITY_TAU_MS = 120_000;
const MAX_OBSERVATIONS = 24;
/**
 * Familiarity is keyed by object identity, and a long session opens and
 * closes an unbounded number of windows. Once an entry has faded to nothing
 * it is indistinguishable from never having seen the thing, so it is dropped
 * rather than kept forever.
 */
const MAX_FAMILIAR = 256;
const FORGOTTEN = 0.02;

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(Math.max(value, lo), hi);

/** One thing the fly has seen, and where it saw it. */
type Observation = {
  at: Point;
  key: string;
  kind: string;
  label: string;
  /** `performance.now()` of the most recent sighting. */
  seenMs: number;
  sightings: number;
};

type Familiarity = {
  count: number;
  lastMs: number;
};

export class FlyMemory {
  /** Recent sightings, most recent last. Capped; oldest are forgotten. */
  public readonly observations: Observation[] = [];

  private readonly danger = new Float32Array(COLS * ROWS);

  private readonly comfort = new Float32Array(COLS * ROWS);

  private readonly familiar = new Map<string, Familiarity>();

  private cell(pos: Point, bounds: Point): number {
    const col = clamp(
      Math.floor(((pos.x + bounds.x / 2) / Math.max(bounds.x, 1)) * COLS),
      0,
      COLS - 1
    );
    const row = clamp(
      Math.floor(((pos.y + bounds.y / 2) / Math.max(bounds.y, 1)) * ROWS),
      0,
      ROWS - 1
    );

    return row * COLS + col;
  }

  /** Something bad happened at `pos`: a swat, a loom, a near miss. */
  public recordThreat(pos: Point, bounds: Point, amount: number): void {
    const i = this.cell(pos, bounds);

    this.danger[i] = clamp(this.danger[i] + amount, 0, 2);
    // Fear overwrites fondness for a place.
    this.comfort[i] = Math.max(this.comfort[i] - amount, 0);
  }

  /** Undisturbed time at `pos` makes it feel like safe ground. */
  public recordCalm(pos: Point, bounds: Point, dt: number): void {
    const i = this.cell(pos, bounds);

    this.comfort[i] = clamp(this.comfort[i] + dt * 0.05, 0, 1);
  }

  /** Remembered danger at `pos`, 0..2. */
  public dangerAt(pos: Point, bounds: Point): number {
    return this.danger[this.cell(pos, bounds)];
  }

  /**
   * How appealing `pos` is as ground, higher is better. Used to rank flight
   * targets: remembered-safe cells win, remembered-dangerous cells lose.
   */
  public valenceAt(pos: Point, bounds: Point): number {
    const i = this.cell(pos, bounds);

    return this.comfort[i] - this.danger[i];
  }

  /** Let both maps fade; call once per frame. */
  public decay(dt: number): void {
    const dDecay = Math.exp(-dt / DANGER_DECAY_TAU);
    const cDecay = Math.exp(-dt / COMFORT_DECAY_TAU);

    for (let i = 0; i < this.danger.length; i += 1) {
      this.danger[i] *= dDecay;
      this.comfort[i] *= cDecay;
    }
  }

  /**
   * Drop objects whose familiarity has decayed to nothing — closed windows,
   * dismissed menus, icons the fly has not walked past in minutes. If every
   * entry is still live, drop the least recently seen instead, so the store
   * stays bounded however busy the desktop gets.
   */
  private forgetFaded(nowMs: number): void {
    let oldestKey: string | undefined;
    let oldestMs = Number.POSITIVE_INFINITY;

    this.familiar.forEach(({ count, lastMs }, key) => {
      if (
        count * Math.exp(-(nowMs - lastMs) / FAMILIARITY_TAU_MS) <
        FORGOTTEN
      ) {
        this.familiar.delete(key);
      } else if (lastMs < oldestMs) {
        oldestMs = lastMs;
        oldestKey = key;
      }
    });

    if (this.familiar.size > MAX_FAMILIAR && oldestKey !== undefined) {
      this.familiar.delete(oldestKey);
    }
  }

  /**
   * The fly looked at something. Records the sighting and returns how novel
   * it was: 1 for never-seen, falling toward 0 with repeated exposure.
   */
  public observe(key: string, kind: string, label: string, at: Point): number {
    const nowMs = performance.now();
    const entry = this.familiar.get(key);
    // Familiarity fades between sightings, so an object unseen for a while
    // regains a little of its novelty.
    const count = entry
      ? entry.count * Math.exp(-(nowMs - entry.lastMs) / FAMILIARITY_TAU_MS)
      : 0;

    this.familiar.set(key, { count: count + 1, lastMs: nowMs });
    if (this.familiar.size > MAX_FAMILIAR) this.forgetFaded(nowMs);

    const existing = this.observations.find((o) => o.key === key);

    if (existing) {
      existing.at = { ...at };
      existing.seenMs = nowMs;
      existing.sightings += 1;
    } else {
      this.observations.push({
        at: { ...at },
        key,
        kind,
        label,
        seenMs: nowMs,
        sightings: 1,
      });
      if (this.observations.length > MAX_OBSERVATIONS) {
        this.observations.shift();
      }
    }

    return 1 / (1 + count);
  }

  /** How novel `key` would be right now, without recording a sighting. */
  public noveltyOf(key: string): number {
    const entry = this.familiar.get(key);

    if (!entry) return 1;

    const count =
      entry.count *
      Math.exp(-(performance.now() - entry.lastMs) / FAMILIARITY_TAU_MS);

    return 1 / (1 + count);
  }
}
