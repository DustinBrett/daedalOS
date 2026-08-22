// What the brain tells the body each frame: how the sim's population rates
// become body commands. Every field is read off a real neuron population.
// Ported from gnat's `signals.rs` / `circadian.rs` (MIT).

import { type Lif } from "utils/desktopFly/lif";

/** Body commands for one frame. */
export type Signals = {
  /** Whole-population activity, roughly 0..1. */
  arousal: number;
  /** An MDN burst: walk backwards. */
  backward: boolean;
  /** The giant fibre spiked: take off now. */
  escape: boolean;
  /** DNg11 grooming command rate, roughly 0..1.5. */
  groomDrive: number;
  /** Looming-detector population rate, 0..1. */
  nervous: number;
  /** Circadian plus idle: sleep-like state. */
  sleep: boolean;
  /** Thermal scaling of locomotion. */
  tempo: number;
  /** Steering, in rad/s, from the DNa01/DNa02 left-right rate difference. */
  turnBias: number;
  /** DNp09 forward-walking command rate, roughly 0..1.5. */
  walkDrive: number;
  /** DNp02/04/11 escape-manoeuvre rate, roughly 0..1.3. */
  wingDrive: number;
};

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(Math.max(value, lo), hi);

/** Turns population rates into body commands. */
export class SignalBuilder {
  private dnaBaseline = 0;

  public make(sim: Lif, dt: number): Signals {
    const rates = sim.getRates();
    const diff = rates.dnaL - rates.dnaR;

    // Slow adaptation, tau about 8 s. The connectome has a persistent
    // left/right wiring asymmetry; adapting it out means steady-state walking
    // is straight and only *transient* DNa asymmetries actually steer.
    this.dnaBaseline += (diff - this.dnaBaseline) * Math.min(dt / 8, 1);

    return {
      arousal: clamp(rates.pop / 20, 0, 1),
      backward: rates.mdn > 8,
      escape: sim.consumeGf(),
      groomDrive: rates.groom / 8,
      // The loom detectors adapt (phasic onset bursts), so their smoothed
      // rate peaks near ~13 Hz on a strong loom rather than the tonic ~80 Hz
      // the upstream normalisation assumed. Darts fire on onsets; sustained
      // threats habituate, as in the real animal.
      nervous: clamp(rates.loom / 16, 0, 1),
      sleep: false,
      tempo: 1,
      turnBias: clamp((diff - this.dnaBaseline) * 0.04, -1, 1),
      walkDrive: clamp(rates.fwd / 10, 0, 1.3),
      wingDrive: clamp(rates.escw / 10, 0, 1.3),
    };
  }
}

// Drosophila circadian activity: morning and evening peaks, a midday siesta,
// night quiescence. Control points of the daily curve, linearly interpolated.
const CIRCADIAN_POINTS: [number, number][] = [
  [0, 0.25],
  [5, 0.25],
  [8, 1],
  [10, 1],
  [13, 0.55],
  [15, 0.55],
  [17, 1],
  [20, 1],
  [23, 0.3],
  [24, 0.25],
];

/** Activity multiplier for a local hour in `0..24`. */
export const circadianActivity = (hour: number): number => {
  for (let i = 0; i < CIRCADIAN_POINTS.length - 1; i += 1) {
    const [h0, v0] = CIRCADIAN_POINTS[i];
    const [h1, v1] = CIRCADIAN_POINTS[i + 1];

    if (hour >= h0 && hour <= h1) {
      return v0 + ((v1 - v0) * (hour - h0)) / Math.max(h1 - h0, 0.001);
    }
  }

  return 0.25;
};
