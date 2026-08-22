// Leaky integrate-and-fire simulation of the fly's escape/steering circuit:
// LC4/LPLC2 looming detectors driving the DNp01 giant fibre, DNa01/DNa02
// steering, MDN backward walking, DNp09 forward walking, DNg11 grooming, and
// the DNp02/04/11 escape-manoeuvre wing DNs, wired with real signed FlyWire
// synapse counts. Ported from gnat's `lif.rs` / DesktopFly's `Sim.swift`
// (MIT); every constant is the upstream value.

import { type Circuit, Role, Side, isLooming } from "utils/desktopFly/circuit";
import { Rng } from "utils/desktopFly/rng";

/** Membrane decay per ms: `exp(-1/20)`, a 20 ms time constant on a 1 ms step. */
const DECAY = 0.9512;
const THRESHOLD = 1;
const REFRACTORY_MS = 2;
/**
 * Turns a raw signed synapse count into a voltage step. Calibrated for the
 * Princeton synapse table (Yu et al. 2024), whose higher recall detects ~3x
 * the synapses of the older table the upstream constant (0.0008) was tuned
 * for; chosen by sweeping against the upstream circuit's reference dynamics
 * (GF silent at rest across seeds, ~4 ms escape latency, live siesta).
 */
const WEIGHT_SCALE = 0.00035;
/** Per-neuron, per-ms probability of a spontaneous depolarisation. */
const P_NOISE = 0.0022;
const NOISE_KICK = 0.42;
const LOOM_GAIN = 0.3;
/** Smoothing for the exponential moving average on group firing rates. */
const RATE_ALPHA = 1 / 120;
/** Inhibition floor, so an inhibited neuron can climb back to threshold. */
const V_FLOOR = -2;

// GABA/glutamate synapses arrive a few ms late; the LC->GF electrical coupling
// is instantaneous. That latency window is why the giant fibre can fire before
// feedforward inhibition lands, and so why the fly escapes at all.
const INH_DELAY_MS = 4;
const INH_SLOTS = INH_DELAY_MS + 1;

/**
 * Gap junctions, which chemical synapse counts under-represent. The upstream
 * value (6) compensated the older synapse table's weak LC->GF detection
 * (1,482 syn); the Princeton table detects that coupling far better
 * (4,257 syn), so the residual boost shrinks accordingly.
 */
const GAP_JUNCTION_BOOST = 2;

// Spike-frequency adaptation on the loom-detector populations. Real LC4 and
// LPLC2 looming responses are phasic — a strong onset burst that adapts
// (Ache et al. 2019) — which is why the giant fibre fires at loom *onset*
// rather than tonically through a sustained stimulus. Each spike adds an
// adaptation current that decays with an ~80 ms time constant.
const ADAPT_KICK = 0.4;
const ADAPT_DECAY = 0.9876; // exp(-1/80)

// Occasional arousal bursts multiply the noise rate for 400 ms.
const BURST_MS = 400;
const BURST_NOISE_FACTOR = 6;
const FIRST_BURST_MS = 12_000;
const BURST_GAP_MIN_MS = 15_000;
const BURST_GAP_MAX_MS = 40_000;

const TWO_PI = Math.PI * 2;

/** Spikes in one millisecond scale to Hz by a factor of 1000. */
const hz = (count: number, pop: number): number =>
  (count * 1000) / Math.max(pop, 1);

const ema = (current: number, target: number): number =>
  current + (target - current) * RATE_ALPHA;

type Stim = {
  idx: number[];
  strength: number;
  untilMs: number;
};

type Groups = {
  /** Ascending partners, carrying leg proprioception. */
  ascend: number[];
  /** DNa01 + DNa02, left. */
  dnaL: number[];
  dnaR: number[];
  /** DNp02/04/11, escape manoeuvre. */
  escw: number[];
  /** DNp09, forward walking. */
  fwd: number[];
  gf: number[];
  /** DNg11, grooming. */
  groom: number[];
  loomLeft: number[];
  loomRight: number[];
  mdn: number[];
  /** Sensory partners, the air-puff pathway. */
  sens: number[];
};

/** Group firing rates, in Hz per neuron, exponentially smoothed. */
type Rates = {
  dnaL: number;
  dnaR: number;
  escw: number;
  fwd: number;
  groom: number;
  loom: number;
  mdn: number;
  /** Whole-population rate. */
  pop: number;
};

/** What the coordinator feeds in each frame. All in 0..1 unless noted. */
type Inputs = {
  /** Circadian and sleep neuromodulation of baseline drive and noise. */
  activityScale: number;
  /** Fast cursor motion near the fly, into the sensory pathway. */
  airPuff: number;
  /** Walking intensity, into the ascending proprioceptive neurons. */
  gaitDrive: number;
  /** Body gait phase, 0..1. */
  gaitPhase: number;
  /** Looming drive on the left eye. */
  loomL: number;
  loomR: number;
  /** Sleep gates sensory input by raising the arousal threshold. */
  sensoryGate: number;
};

export class Lif {
  public inputs: Inputs = {
    activityScale: 1,
    airPuff: 0,
    gaitDrive: 0,
    gaitPhase: 0,
    loomL: 0,
    loomR: 0,
    sensoryGate: 1,
  };

  private readonly n: number;

  private readonly roles: Role[];

  private readonly v: Float32Array;

  private readonly refr: Float32Array;

  /** Adaptation current, loom-detector neurons only. */
  private readonly adapt: Float32Array;

  private readonly isLoomNeuron: Uint8Array;

  /** Per-neuron constant drive, heterogeneous so interneurons crackle. */
  private readonly baseline: Float32Array;

  // CSR adjacency, weights pre-scaled.
  private readonly rowStart: Uint32Array;

  private readonly colIdx: Uint32Array;

  private readonly w: Float32Array;

  private readonly groups: Groups;

  private readonly dnaIsLeft: boolean[];

  /** Per-ascending-neuron gait phase offset. */
  private readonly ascendPhase: number[];

  private rates: Rates = {
    dnaL: 0,
    dnaR: 0,
    escw: 0,
    fwd: 0,
    groom: 0,
    loom: 0,
    mdn: 0,
    pop: 0,
  };

  private gfLatch = false;

  private simMs = 0;

  private readonly inhQueue: Float32Array[];

  private qHead = 0;

  private burstUntil = 0;

  private burstNext = FIRST_BURST_MS;

  private stims: Stim[] = [];

  private readonly rng: Rng;

  public constructor(circuit: Circuit, seed: number) {
    const n = circuit.neurons.length;
    const rng = new Rng(seed);
    const roles = circuit.neurons.map(({ role }) => role);
    const groups: Groups = {
      ascend: [],
      dnaL: [],
      dnaR: [],
      escw: [],
      fwd: [],
      gf: [],
      groom: [],
      loomLeft: [],
      loomRight: [],
      mdn: [],
      sens: [],
    };

    circuit.neurons.forEach(({ cellType, role, side }, i) => {
      switch (role) {
        // All four LC populations are loom-sensitive and receive the visual
        // looming drive; only LC4/LPLC2 couple electrically into the GF.
        case Role.Lc4:
        case Role.Lc6:
        case Role.Lc16:
        case Role.Lplc2:
          if (side === Side.Left) groups.loomLeft.push(i);
          else groups.loomRight.push(i);
          break;
        case Role.Gf:
          groups.gf.push(i);
          break;
        case Role.Dna01:
        case Role.Dna02:
          if (side === Side.Left) groups.dnaL.push(i);
          else groups.dnaR.push(i);
          break;
        case Role.Mdn:
          groups.mdn.push(i);
          break;
        case Role.Dnp09:
          groups.fwd.push(i);
          break;
        case Role.Dng11:
          groups.groom.push(i);
          break;
        case Role.Escw:
          groups.escw.push(i);
          break;
        default:
          if (cellType === "ascending") groups.ascend.push(i);
          else if (cellType === "sensory") groups.sens.push(i);
      }
    });

    const dnaIsLeft = Array.from({ length: n }, () => false);

    groups.dnaL.forEach((i) => {
      dnaIsLeft[i] = true;
    });

    const ascendPhase = groups.ascend.map(() => rng.range(0, TWO_PI));
    const baseline = new Float32Array(n);

    roles.forEach((role, i) => {
      switch (role) {
        case Role.Other:
          baseline[i] = rng.range(0.01, 0.07);
          break;
        case Role.Lc4:
        case Role.Lc6:
        case Role.Lc16:
        case Role.Lplc2:
          baseline[i] = 0.004;
          break;
        case Role.Dnp09:
          baseline[i] = 0.038;
          break;
        case Role.Gf:
          // The giant fibre stays quiet unless synaptically driven.
          baseline[i] = 0.002;
          break;
        default:
          // Command DNs get deterministic, side-symmetric baselines.
          baseline[i] = 0.036;
      }
    });

    // Build CSR adjacency.
    const counts = new Uint32Array(n);

    circuit.edges.forEach(([pre]) => {
      counts[pre] += 1;
    });

    const rowStart = new Uint32Array(n + 1);

    for (let i = 0; i < n; i += 1) rowStart[i + 1] = rowStart[i] + counts[i];

    const colIdx = new Uint32Array(circuit.edges.length);
    const w = new Float32Array(circuit.edges.length);
    const fill = rowStart.slice(0, n);

    circuit.edges.forEach(([pre, post, syn]) => {
      let weight = syn * WEIGHT_SCALE;
      const electrical =
        isLooming(roles[pre]) ||
        (roles[pre] === Role.Other &&
          circuit.neurons[pre].cellType === "sensory");

      if (electrical && roles[post] === Role.Gf) weight *= GAP_JUNCTION_BOOST;

      colIdx[fill[pre]] = post;
      w[fill[pre]] = weight;
      fill[pre] += 1;
    });

    this.n = n;
    this.roles = roles;
    this.v = new Float32Array(n);
    this.refr = new Float32Array(n);
    this.adapt = new Float32Array(n);
    this.isLoomNeuron = new Uint8Array(n);
    groups.loomLeft.forEach((i) => {
      this.isLoomNeuron[i] = 1;
    });
    groups.loomRight.forEach((i) => {
      this.isLoomNeuron[i] = 1;
    });
    this.baseline = baseline;
    this.rowStart = rowStart;
    this.colIdx = colIdx;
    this.w = w;
    this.groups = groups;
    this.dnaIsLeft = dnaIsLeft;
    this.ascendPhase = ascendPhase;
    this.inhQueue = Array.from(
      { length: INH_SLOTS },
      () => new Float32Array(n)
    );
    this.rng = rng;
  }

  public get neuronCount(): number {
    return this.n;
  }

  public getGroups(): Groups {
    return this.groups;
  }

  public getRates(): Rates {
    return this.rates;
  }

  /**
   * Whether the giant fibre has fired since this was last called. Reading it
   * clears the latch, so exactly one caller may consume it.
   */
  public consumeGf(): boolean {
    const fired = this.gfLatch;

    this.gfLatch = false;

    return fired;
  }

  /** Inject current into a population for a fixed duration. */
  public stimulate(
    indices: number[],
    strength: number,
    durationMs: number
  ): void {
    if (indices.length === 0) return;

    this.stims.push({
      idx: indices,
      strength,
      untilMs: this.simMs + durationMs,
    });
    if (this.stims.length > 8) this.stims.shift();
  }

  /** Advance the simulation by `ms` milliseconds. */
  public step(ms: number): void {
    for (let i = 0; i < ms; i += 1) this.stepOneMs();
  }

  private stepOneMs(): void {
    this.simMs += 1;

    const now = this.simMs;

    this.stims = this.stims.filter(({ untilMs }) => now < untilMs);

    if (now >= this.burstNext) {
      this.burstUntil = now + BURST_MS;
      this.burstNext =
        now + this.rng.rangeInt(BURST_GAP_MIN_MS, BURST_GAP_MAX_MS);
    }

    const { inputs, n, refr, rng, v } = this;
    const p =
      (now < this.burstUntil ? P_NOISE * BURST_NOISE_FACTOR : P_NOISE) *
      inputs.activityScale;

    // Leak, baseline drive, spontaneous noise, and loom adaptation.
    const { adapt } = this;

    for (let i = 0; i < n; i += 1) {
      if (refr[i] > 0) {
        refr[i] -= 1;
        v[i] *= DECAY;
        if (adapt[i] > 0.0001) adapt[i] *= ADAPT_DECAY;
      } else {
        let vi = v[i] * DECAY + this.baseline[i] * inputs.activityScale;

        if (rng.float() < p) vi += NOISE_KICK;
        if (adapt[i] > 0.0001) {
          vi -= adapt[i];
          adapt[i] *= ADAPT_DECAY;
        }
        v[i] = vi;
      }
    }

    // Sensory drive.
    if (inputs.loomL > 0.001) {
      const d = inputs.loomL * LOOM_GAIN * inputs.sensoryGate;

      this.groups.loomLeft.forEach((i) => {
        v[i] += d;
      });
    }
    if (inputs.loomR > 0.001) {
      const d = inputs.loomR * LOOM_GAIN * inputs.sensoryGate;

      this.groups.loomRight.forEach((i) => {
        v[i] += d;
      });
    }
    // Body to brain: gait rhythm into the ascending proprioceptive neurons.
    if (inputs.gaitDrive > 0.001) {
      const ph = inputs.gaitPhase * TWO_PI;

      this.groups.ascend.forEach((i, k) => {
        v[i] +=
          inputs.gaitDrive *
          0.09 *
          (0.5 + 0.5 * Math.sin(ph + this.ascendPhase[k]));
      });
    }
    if (inputs.airPuff > 0.001) {
      const d = inputs.airPuff * 0.12 * inputs.sensoryGate;

      this.groups.sens.forEach((i) => {
        v[i] += d;
      });
    }
    this.stims.forEach(({ idx, strength }) => {
      idx.forEach((i) => {
        v[i] += strength;
      });
    });

    // Deliver the inhibition scheduled for this millisecond.
    const slot = this.inhQueue[this.qHead];

    for (let i = 0; i < n; i += 1) {
      if (slot[i] !== 0) {
        v[i] = Math.max(v[i] + slot[i], V_FLOOR);
        slot[i] = 0;
      }
    }

    // Threshold.
    const spiked: number[] = [];

    for (let i = 0; i < n; i += 1) {
      if (refr[i] <= 0 && v[i] >= THRESHOLD) {
        v[i] = 0;
        refr[i] = REFRACTORY_MS;
        if (this.isLoomNeuron[i]) adapt[i] += ADAPT_KICK;
        spiked.push(i);
      }
    }

    // Propagate: excitation lands immediately, inhibition is queued.
    const inhSlot = this.inhQueue[(this.qHead + INH_DELAY_MS) % INH_SLOTS];

    spiked.forEach((i) => {
      const end = this.rowStart[i + 1];

      for (let k = this.rowStart[i]; k < end; k += 1) {
        const j = this.colIdx[k];
        const weight = this.w[k];

        if (weight >= 0) v[j] = Math.max(v[j] + weight, V_FLOOR);
        else inhSlot[j] += weight;
      }
    });
    this.qHead = (this.qHead + 1) % INH_SLOTS;

    this.updateRates(spiked);
  }

  private updateRates(spiked: number[]): void {
    let cLoom = 0;
    let cDl = 0;
    let cDr = 0;
    let cM = 0;
    let cF = 0;
    let cG = 0;
    let cW = 0;

    spiked.forEach((i) => {
      switch (this.roles[i]) {
        case Role.Lc4:
        case Role.Lc6:
        case Role.Lc16:
        case Role.Lplc2:
          cLoom += 1;
          break;
        case Role.Dna01:
        case Role.Dna02:
          if (this.dnaIsLeft[i]) cDl += 1;
          else cDr += 1;
          break;
        case Role.Mdn:
          cM += 1;
          break;
        case Role.Dnp09:
          cF += 1;
          break;
        case Role.Dng11:
          cG += 1;
          break;
        case Role.Escw:
          cW += 1;
          break;
        case Role.Gf:
          this.gfLatch = true;
          break;
        default:
          break;
      }
    });

    const { groups, rates } = this;
    const nLoom = groups.loomLeft.length + groups.loomRight.length;

    rates.loom = ema(rates.loom, hz(cLoom, nLoom));
    rates.dnaL = ema(rates.dnaL, hz(cDl, groups.dnaL.length));
    rates.dnaR = ema(rates.dnaR, hz(cDr, groups.dnaR.length));
    rates.mdn = ema(rates.mdn, hz(cM, groups.mdn.length));
    rates.fwd = ema(rates.fwd, hz(cF, groups.fwd.length));
    rates.groom = ema(rates.groom, hz(cG, groups.groom.length));
    rates.escw = ema(rates.escw, hz(cW, groups.escw.length));
    rates.pop = ema(rates.pop, hz(spiked.length, this.n));
  }
}
