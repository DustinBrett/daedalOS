/* eslint-disable max-classes-per-file */
// Two classes, deliberately together: `CompiledCircuit` is the wiring turned
// into adjacency, and `Lif` is one fly's state running on it. They share
// every calibration constant in this file, so splitting them would only mean
// exporting the whole tuning table.
//
// Leaky integrate-and-fire simulation of the fly's escape/steering circuit:
// LC4/LPLC2 looming detectors driving the DNp01 giant fibre, DNa01/DNa02
// steering, MDN backward walking, DNp09 forward walking, DNg11 grooming, and
// the DNp02/04/11 escape-manoeuvre wing DNs, wired with real signed FlyWire
// synapse counts. Ported from gnat's `lif.rs` / DesktopFly's `Sim.swift`
// (MIT); every constant is the upstream value.

import {
  type Circuit,
  Role,
  Side,
  isCompass,
  isLooming,
} from "utils/desktopFly/circuit";
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
 *
 * This is far weaker per synapse than the whole-brain reference model
 * (Shiu et al. 2024, ~0.6% of threshold per synapse), and deliberately so.
 * That model carries all 127,400 neurons; this one is a 5.7% subset chosen
 * around the strongest convergent bundles — LC4/LPLC2 onto the giant fibre,
 * PN claws onto Kenyon cells, the compass ring — with most of the
 * inhibitory context that balances them left out. Sweeping this constant
 * upward was measured: at 2x the compass bump dissolves (coherence 0.46 to
 * 0.04) and Kenyon codes swell to 24% of the population; at 4x the giant
 * fibre fires 604 times in 45 s of quiet. The subset only stays stable at
 * this level.
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

// Central-complex compass. The EPG/PEN/Delta7/PEG cells and their synapses
// are the real FlyWire wiring; the ring works as an attractor once its
// internal pathways get gains of their own (the raw WEIGHT_SCALE is tuned
// for the escape pathway's much larger synapse counts) and the compass
// cells sit closer to threshold than the periphery. PEN drive shifted by
// the fly's own turning moves the bump, exactly as in the animal.
// Excitatory loop (EPG->PEN->EPG, EPG->EPG, PEG) vs the Delta7 inhibitory
// surround; PEN->PEN recurrence is damped so the shifters cannot run away.
const CX_EXC_GAIN = 10;
const CX_INH_GAIN = 12;
const CX_PENPEN_DAMP = 0.3;
const CX_D7D7_DAMP = 0.5;
const EPG_BASELINE = 0.035;
const PEN_BASELINE = 0.03;
const D7_BASELINE = 0.03;
const PEG_BASELINE = 0.03;
/** Voltage per ms into the turn-side PEN population per rad/s of rotation. */
const ROT_GAIN = 0.35;
/** Rotation input saturates at this many rad/s. */
const ROT_MAX = 8;

// Visual projection populations with direct behavioural readouts: LC11
// (small moving objects), driven per eye like the loom populations. LC10a
// cells are present with their real wiring but carry no behavioural
// mapping — their courtship role belongs to the male brain, and FAFB is a
// female's.
const LC_BASELINE = 0.004;
const SMALL_OBJ_GAIN = 0.25;

// Mushroom body. Kenyon cells are near-silent until a stimulus pattern is
// driven into them; MBONs fire tonically and read the KC code through
// plastic synapses; PPL1 (punishment) and PAM (reward) dopamine spikes
// gate depression of recently-active KC->MBON synapses in their own
// compartment — Aso et al.'s valence model running on the real wiring.
const KC_BASELINE = 0.002;
const MBON_BASELINE = 0.03;
const DAN_BASELINE = 0.004;
const MBAUX_BASELINE = 0.02;
/** Gain on KC->MBON synapses so a sparse KC code moves the readout. */
const MB_KC_GAIN = 10;
/**
 * Gain on PN->KC claws: raw per-claw weights are far below KC threshold,
 * so coincident claws must sum to a spike while APL feedback keeps the
 * population code sparse.
 */
const PN_KC_GAIN = 24;
const PN_BASELINE = 0.004;
/** Normalises the DAN spike accumulator into a 0..1 teaching signal. */
const DAN_NORM = 40;
/** Depression per plasticity tick, scaled by eligibility and DAN drive. */
const MB_LEARN_RATE = 0.3;
/** Depressed synapses bottom out at this fraction of their naive weight. */
const MB_W_FLOOR = 0.15;
/** Per-tick recovery toward naive weight; tau is minutes. */
const MB_RECOVER = 0.0001;
const MB_PLAST_INTERVAL_MS = 50;
/** Eligibility trace decay per ms: exp(-1/3000), a 3 s window. */
const ELIG_DECAY = 0.99967;
/** Refold the eligibility decay factor once it shrinks past this. */
const ELIG_RENORM = 1e-6;
/** DAN activity accumulator decay per ms. */
const DAN_ACCUM_DECAY = 0.98;

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
  idx: Int32Array | number[];
  strength: number;
  untilMs: number;
};

/**
 * Neuron index lists per population. Flat `Int32Array`s: these are walked
 * every millisecond of every fly's simulation, and they are identical for
 * every fly, so they are built once and shared.
 */
type Groups = {
  /** Ascending partners, carrying leg proprioception. */
  ascend: Int32Array;
  /** DNa01 + DNa02, left. */
  dnaL: Int32Array;
  dnaR: Int32Array;
  /** EPG compass cells, the heading bump. */
  epg: Int32Array;
  /** DNp02/04/11, escape manoeuvre. */
  escw: Int32Array;
  /** DNp09, forward walking. */
  fwd: Int32Array;
  gf: Int32Array;
  /** DNg11, grooming. */
  groom: Int32Array;
  /** Kenyon cells, the mushroom body stimulus code. */
  kc: Int32Array;
  /** LC11 small-object detectors, per eye. */
  lc11L: Int32Array;
  lc11R: Int32Array;
  loomLeft: Int32Array;
  loomRight: Int32Array;
  /** MBONs whose depression signals avoidance (PPL1 compartments). */
  mbonApp: Int32Array;
  /** MBONs whose depression signals approach (PAM compartments). */
  mbonAvd: Int32Array;
  mdn: Int32Array;
  /** Reward dopamine neurons. */
  pam: Int32Array;
  /**
   * PEN rotation shifters, split by measured shift direction (the side
   * byte encodes which way each cell's wiring moves the bump).
   */
  penL: Int32Array;
  penR: Int32Array;
  /** PFNd/PFNv vector cells, fed by self-motion. */
  pfn: Int32Array;
  /** Antennal-lobe projection neurons, the stimulus entry point. */
  pn: Int32Array;
  /** Punishment dopamine neurons. */
  ppl1: Int32Array;
  /** Sensory partners, the air-puff pathway. */
  sens: Int32Array;
};

/** Population index lists while they are still being collected. */
type GroupLists = Record<keyof Groups, number[]>;

/** Group firing rates, in Hz per neuron, exponentially smoothed. */
type Rates = {
  /**
   * Spike rate over the central brain — everything except the Kenyon
   * cells. The mushroom body is most of the neuron count and is silent by
   * design, so folding it into a "how awake is this fly" readout mostly
   * measures how many Kenyon cells the circuit happens to contain.
   */
  central: number;
  dnaL: number;
  dnaR: number;
  escw: number;
  fwd: number;
  groom: number;
  /** LC11 small-object rate: pooled, and per eye for orienting. */
  lc11: number;
  lc11L: number;
  lc11R: number;
  loom: number;
  /** Per-eye loom rates: escape direction depends on the loomed side. */
  loomLeft: number;
  loomRight: number;
  /** Approach-driving MBON rate (PPL1 compartments). */
  mbApp: number;
  /** Avoidance-driving MBON rate (PAM compartments). */
  mbAvd: number;
  mdn: number;
  /**
   * Whole-population rate, every neuron in the file.
   */
  pop: number;
};

/**
 * A fly's private stimulus encoding for an object: the subset of cells its
 * senses activate, chosen by hashing the object's identity with the fly's
 * own salt. Objects are presented to the brain as antennal-lobe projection
 * neuron combinations (roughly a quarter of the PNs, like an odor's
 * glomerular code); everything downstream — the sparse Kenyon-cell code,
 * its reliability, and its pattern separation — emerges from the real
 * PN->KC claws and APL inhibition rather than being imposed here.
 */
export const patternFor = (
  cells: Int32Array | number[],
  key: string,
  salt: number,
  oneIn = 4
): number[] => {
  /* eslint-disable no-bitwise */
  const out: number[] = [];
  let base = 2_166_136_261 ^ salt;

  for (let c = 0; c < key.length; c += 1) {
    base ^= key.codePointAt(c) ?? 0;
    base = Math.imul(base, 16_777_619);
  }
  cells.forEach((cell: number, k: number) => {
    let h = base ^ k;

    h = Math.imul(h ^ (h >>> 15), 2_246_822_519);
    h ^= h >>> 13;
    if ((h >>> 0) % oneIn === 0) out.push(cell);
  });

  return out;
  /* eslint-enable no-bitwise */
};

/** What the coordinator feeds in each frame. All in 0..1 unless noted. */
export type Inputs = {
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
  /** Body rotation in rad/s (+ is CCW); drives the PEN bump shifters. */
  rotation: number;
  /** Sleep gates sensory input by raising the arousal threshold. */
  sensoryGate: number;
  /** Small moving object in the left/right eye, into LC11. */
  smallObjL: number;
  smallObjR: number;
};

/**
 * The wiring, compiled once and shared by every fly.
 *
 * Turning 136k connections into CSR adjacency is the expensive part of
 * starting a fly, and none of it depends on the fly: the graph, the
 * populations, the pathway gains and the plastic-synapse registry are
 * properties of the connectome, not of the individual. Only the mutable
 * state — membrane voltages, refractory counters, eligibility traces, the
 * learned weights and each fly's own baseline jitter — belongs to a fly.
 * Compiling once turns spawning the sixth fly into a couple of typed-array
 * copies instead of a full rebuild of the graph.
 */
export class CompiledCircuit {
  public readonly n: number;

  public readonly roles: Uint8Array;

  public readonly sides: Uint8Array;

  public readonly rowStart: Uint32Array;

  public readonly colIdx: Uint32Array;

  /** Naive (unlearned) synapse weights. Each fly learns on its own copy. */
  public readonly wBase: Float32Array;

  /** Per-edge flag: inhibition applied immediately (compass-internal). */
  public readonly imm: Uint8Array;

  public readonly isLoomNeuron: Uint8Array;

  public readonly groups: Groups;

  /** Ring coordinate of each EPG in `groups.epg`, radians. */
  public readonly epgAngles: Float64Array;

  /** Neuron index -> position in `groups.epg`, or -1. */
  public readonly epgIndexOf: Int32Array;

  /** Neuron index -> position in `groups.kc`, or -1. */
  public readonly kcIndexOf: Int32Array;

  /** Neuron index -> 1 when this is a left-side DNa cell. */
  public readonly dnaIsLeft: Uint8Array;

  // Plastic KC->MBON synapses: CSR slot, KC ordinal, compartment, naive
  // weight. Learning edits a fly's own `w`; recovery pulls it back to naive.
  public readonly plSlot: Uint32Array;

  public readonly plKc: Int32Array;

  public readonly plAvd: Uint8Array;

  public readonly plBase: Float32Array;

  /** The deterministic part of each neuron's constant drive. */
  public readonly baselineTemplate: Float32Array;

  /** Neurons whose baseline is jittered per fly (the interneuron pool). */
  public readonly jitteredBaseline: Int32Array;

  /**
   * Neurons exempt from the spontaneous depolarisation term. That term stands
   * in for synaptic bombardment by the neurons this circuit does not carry,
   * which is a fair model for an interneuron and a bad one for the giant
   * fibre: DNp01 is a command neuron with an unusually high spike threshold
   * whose excitatory drive is dominated by the LC4/LPLC2 convergence that
   * *is* modelled here (von Reyn et al. 2014). Left in the pool it fired
   * about once every two minutes on a brain receiving no input at all, and
   * every one of those spikes became a full-speed escape takeoff with
   * nothing to escape from.
   */
  public readonly noiseExempt: Uint8Array;

  public constructor(circuit: Circuit) {
    const { edgeCount, edgePost, edgePre, edgeSyn, neurons } = circuit;
    const n = neurons.length;
    const roles = new Uint8Array(n);
    const sides = new Uint8Array(n);
    const lists: GroupLists = {
      ascend: [],
      dnaL: [],
      dnaR: [],
      epg: [],
      escw: [],
      fwd: [],
      gf: [],
      groom: [],
      kc: [],
      lc11L: [],
      lc11R: [],
      loomLeft: [],
      loomRight: [],
      mbonApp: [],
      mbonAvd: [],
      mdn: [],
      pam: [],
      penL: [],
      penR: [],
      pfn: [],
      pn: [],
      ppl1: [],
      sens: [],
    };
    const epgAngles: number[] = [];
    const jittered: number[] = [];
    const baseline = new Float32Array(n);

    neurons.forEach(({ angle, cellType, role, side }, i) => {
      roles[i] = role;
      sides[i] = side;
      switch (role) {
        // All four LC populations are loom-sensitive and receive the visual
        // looming drive; only LC4/LPLC2 couple electrically into the GF.
        case Role.Lc4:
        case Role.Lc6:
        case Role.Lc16:
        case Role.Lplc2:
          if (side === Side.Left) lists.loomLeft.push(i);
          else lists.loomRight.push(i);
          baseline[i] = 0.004;
          break;
        case Role.Gf:
          lists.gf.push(i);
          // The giant fibre stays quiet unless synaptically driven.
          baseline[i] = 0.002;
          break;
        case Role.Dna01:
        case Role.Dna02:
          if (side === Side.Left) lists.dnaL.push(i);
          else lists.dnaR.push(i);
          baseline[i] = 0.036;
          break;
        case Role.Mdn:
          lists.mdn.push(i);
          baseline[i] = 0.036;
          break;
        case Role.Dnp09:
          lists.fwd.push(i);
          baseline[i] = 0.038;
          break;
        case Role.Dng11:
          lists.groom.push(i);
          baseline[i] = 0.036;
          break;
        case Role.Escw:
          lists.escw.push(i);
          baseline[i] = 0.036;
          break;
        // Compass cells idle close to threshold so recurrence can hold a
        // bump alive between inputs.
        case Role.Epg:
          if (angle !== undefined) {
            lists.epg.push(i);
            epgAngles.push(angle);
          }
          baseline[i] = EPG_BASELINE;
          break;
        case Role.Pen:
          if (side === Side.Left) lists.penL.push(i);
          else lists.penR.push(i);
          baseline[i] = PEN_BASELINE;
          break;
        case Role.Delta7:
          baseline[i] = D7_BASELINE;
          break;
        case Role.Peg:
          baseline[i] = PEG_BASELINE;
          break;
        case Role.Lc11:
          if (side === Side.Left) lists.lc11L.push(i);
          else lists.lc11R.push(i);
          baseline[i] = LC_BASELINE;
          break;
        case Role.Lc10a:
          baseline[i] = LC_BASELINE;
          break;
        case Role.Kc:
          lists.kc.push(i);
          // Near-silent until a stimulus pattern is driven in.
          baseline[i] = KC_BASELINE;
          break;
        case Role.Mbon:
          // Side byte carries the dopamine-compartment tag: PPL1-compartment
          // MBONs drive approach, PAM-compartment MBONs drive avoidance.
          if (side === Side.Left) lists.mbonApp.push(i);
          else lists.mbonAvd.push(i);
          baseline[i] = MBON_BASELINE;
          break;
        case Role.Ppl1:
          lists.ppl1.push(i);
          baseline[i] = DAN_BASELINE;
          break;
        case Role.Pam:
          lists.pam.push(i);
          baseline[i] = DAN_BASELINE;
          break;
        case Role.Pn:
          lists.pn.push(i);
          baseline[i] = PN_BASELINE;
          break;
        case Role.Pfn:
          lists.pfn.push(i);
          baseline[i] = 0.03;
          break;
        case Role.Hdb:
          // Fan-shaped-body vector cells idle near the compass regime;
          // their heading-frame input arrives through real Delta7/EPG
          // wiring, their velocity input at runtime.
          baseline[i] = 0.03;
          break;
        case Role.Mbaux:
          baseline[i] = MBAUX_BASELINE;
          break;
        default:
          if (cellType === "ascending") lists.ascend.push(i);
          else if (cellType === "sensory") lists.sens.push(i);
          // The interneuron pool is the one population whose drive differs
          // between individuals, so no two brains crackle alike.
          jittered.push(i);
      }
    });

    const groups = Object.fromEntries(
      Object.entries(lists).map(([key, value]) => [key, Int32Array.from(value)])
    ) as Groups;

    const isLoomNeuron = new Uint8Array(n);

    groups.loomLeft.forEach((i) => {
      isLoomNeuron[i] = 1;
    });
    groups.loomRight.forEach((i) => {
      isLoomNeuron[i] = 1;
    });

    const dnaIsLeft = new Uint8Array(n);

    groups.dnaL.forEach((i) => {
      dnaIsLeft[i] = 1;
    });

    const kcIndexOf = new Int32Array(n).fill(-1);

    groups.kc.forEach((i, k) => {
      kcIndexOf[i] = k;
    });

    const epgIndexOf = new Int32Array(n).fill(-1);

    groups.epg.forEach((i, k) => {
      epgIndexOf[i] = k;
    });

    // Weight every edge first, so edges that end up silent can be dropped
    // from the adjacency entirely rather than walked a thousand times a
    // second to add zero (dopamine onto Kenyon cells is the whole of that
    // set: it is modulatory, and lives in applyPlasticity instead).
    const weights = new Float32Array(edgeCount);
    const immediate = new Uint8Array(edgeCount);
    const counts = new Uint32Array(n);
    let kept = 0;

    for (let e = 0; e < edgeCount; e += 1) {
      const pre = edgePre[e];
      const post = edgePost[e];
      const rPre = roles[pre] as Role;
      const rPost = roles[post] as Role;
      let weight = edgeSyn[e] * WEIGHT_SCALE;

      // Dopamine onto Kenyon cells is modulatory, not fast excitation — it
      // IS the plasticity signal. Left as excitatory weight it would fire
      // the whole KC population at every punishment and teach everything.
      if ((rPre === Role.Ppl1 || rPre === Role.Pam) && rPost === Role.Kc) {
        weight = 0;
      } else {
        const electrical =
          isLooming(rPre) ||
          (rPre === Role.Other && neurons[pre].cellType === "sensory");

        if (electrical && rPost === Role.Gf) weight *= GAP_JUNCTION_BOOST;
        // The compass ring's internal synapses run at pathway gains of their
        // own: its per-pair counts are far smaller than the escape pathway's,
        // and an attractor lives or dies on its excitation/inhibition
        // balance.
        if (isCompass(rPre) && isCompass(rPost)) {
          if (weight < 0) {
            // Inhibitory ring synapses (Delta7's output): the bump's
            // surround.
            weight *=
              rPre === Role.Delta7 && rPost === Role.Delta7
                ? CX_INH_GAIN * CX_D7D7_DAMP
                : CX_INH_GAIN;
            // The 4 ms inhibition queue models slow chemical loops on the
            // way to the giant fibre; inside the compass that delay
            // destabilises the bump, so ring inhibition integrates
            // continuously instead.
            immediate[e] = 1;
          } else {
            // Excitatory ring synapses, PEN->PEN recurrence damped.
            weight *=
              rPre === Role.Pen && rPost === Role.Pen
                ? CX_EXC_GAIN * CX_PENPEN_DAMP
                : CX_EXC_GAIN;
          }
        }
        // PN claws onto Kenyon cells: the expansion layer. Coincident claws
        // must sum to a KC spike, so they run at their own gain.
        if (rPre === Role.Pn && rPost === Role.Kc && weight > 0) {
          weight *= PN_KC_GAIN;
        }
        // The plastic synapses: excitatory KC->MBON, boosted so a sparse KC
        // code can move the tonic MBON readout.
        if (rPre === Role.Kc && rPost === Role.Mbon && weight > 0) {
          weight *= MB_KC_GAIN;
        }
      }

      weights[e] = weight;
      if (weight !== 0) {
        counts[pre] += 1;
        kept += 1;
      }
    }

    const rowStart = new Uint32Array(n + 1);

    for (let i = 0; i < n; i += 1) rowStart[i + 1] = rowStart[i] + counts[i];

    const colIdx = new Uint32Array(kept);
    const wBase = new Float32Array(kept);
    const imm = new Uint8Array(kept);
    const fill = rowStart.slice(0, n);
    const plSlot: number[] = [];
    const plKc: number[] = [];
    const plAvd: number[] = [];
    const plBase: number[] = [];

    for (let e = 0; e < edgeCount; e += 1) {
      const weight = weights[e];

      if (weight !== 0) {
        const pre = edgePre[e];
        const post = edgePost[e];
        const slot = fill[pre];

        if (
          (roles[pre] as Role) === Role.Kc &&
          (roles[post] as Role) === Role.Mbon &&
          weight > 0
        ) {
          plSlot.push(slot);
          plKc.push(kcIndexOf[pre]);
          plAvd.push(sides[post] === Side.Right ? 1 : 0);
          plBase.push(weight);
        }
        colIdx[slot] = post;
        wBase[slot] = weight;
        imm[slot] = immediate[e];
        fill[pre] = slot + 1;
      }
    }

    this.n = n;
    this.roles = roles;
    this.sides = sides;
    this.rowStart = rowStart;
    this.colIdx = colIdx;
    this.wBase = wBase;
    this.imm = imm;
    this.isLoomNeuron = isLoomNeuron;
    this.groups = groups;
    this.epgAngles = Float64Array.from(epgAngles);
    this.epgIndexOf = epgIndexOf;
    this.kcIndexOf = kcIndexOf;
    this.dnaIsLeft = dnaIsLeft;
    this.plSlot = Uint32Array.from(plSlot);
    this.plKc = Int32Array.from(plKc);
    this.plAvd = Uint8Array.from(plAvd);
    this.plBase = Float32Array.from(plBase);
    this.baselineTemplate = baseline;
    this.jitteredBaseline = Int32Array.from(jittered);

    const noiseExempt = new Uint8Array(n);

    groups.gf.forEach((i) => {
      noiseExempt[i] = 1;
    });
    this.noiseExempt = noiseExempt;
  }
}

export class Lif {
  public inputs: Inputs = {
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
  };

  /** The shared wiring: graph, populations, pathway gains, plastic slots. */
  private readonly c: CompiledCircuit;

  private readonly n: number;

  private readonly v: Float32Array;

  private readonly refr: Float32Array;

  /** Adaptation current, loom-detector neurons only. */
  private readonly adapt: Float32Array;

  /** Per-neuron constant drive, heterogeneous so interneurons crackle. */
  private readonly baseline: Float32Array;

  /**
   * `baseline * activityScale`, cached. The fused threshold+decay pass reads
   * it once per neuron per ms; recomputing the product there was a fifth of
   * the whole sim's cost. Refreshed only when the scale actually changes,
   * which is at most once per animation frame.
   */
  private readonly sb: Float32Array;

  private sbScale = -1;

  /** This fly's own synapse weights: starts naive, learning edits it. */
  private readonly w: Float32Array;

  /** Per-EPG smoothed firing rate, Hz, for the bump readout. */
  private readonly epgRate: Float32Array;

  /** Per-KC eligibility trace: recently-active codes can be taught. */
  private readonly elig: Float32Array;

  /**
   * Eligibility is stored pre-divided by this running decay factor, so the
   * whole trace ages with one multiply per millisecond instead of a sweep
   * over every Kenyon cell. True eligibility of cell k is
   * `elig[k] * eligScale`. Renormalised before the factor gets small enough
   * to cost precision.
   */
  private eligScale = 1;

  /** Whether any loom detector is still adapting, to pick the fast path. */
  private adaptLive = false;

  /** Which plastic synapses are currently depressed, and their ordinals. */
  private readonly plDirty: Uint8Array;

  private readonly dirtyList: Uint32Array;

  private dirtyCount = 0;

  /** Decaying dopamine spike accumulators, the teaching signals. */
  private punishAcc = 0;

  private rewardAcc = 0;

  /** Per-ascending-neuron gait phase offset. */
  private readonly ascendPhase: Float32Array;

  /** Which neurons fired this millisecond, and how many. Reused: at 1 kHz
   * a fresh array per step is the single largest source of garbage here. */
  private readonly spiked: Int32Array;

  private spikeCount = 0;

  /** Per-EPG "fired this millisecond" flags, reused for the same reason. */
  private readonly epgFired: Uint8Array;

  private rates: Rates = {
    central: 0,
    dnaL: 0,
    dnaR: 0,
    escw: 0,
    fwd: 0,
    groom: 0,
    lc11: 0,
    lc11L: 0,
    lc11R: 0,
    loom: 0,
    loomLeft: 0,
    loomRight: 0,
    mbApp: 0,
    mbAvd: 0,
    mdn: 0,
    pop: 0,
  };

  private gfLatch = false;

  private simMs = 0;

  private readonly inhQueue: Float32Array[];

  /** Which neurons each queued slot actually carries inhibition for. */
  private readonly inhTouched: Int32Array[];

  private readonly inhCount: Int32Array;

  private qHead = 0;

  private burstUntil = 0;

  private burstNext = FIRST_BURST_MS;

  private stims: Stim[] = [];

  private readonly rng: Rng;

  public constructor(compiled: CompiledCircuit, seed: number) {
    const { groups, n } = compiled;
    const rng = new Rng(seed);

    this.c = compiled;
    this.n = n;
    this.rng = rng;
    this.v = new Float32Array(n);
    this.refr = new Float32Array(n);
    this.adapt = new Float32Array(n);
    this.spiked = new Int32Array(n);
    this.epgRate = new Float32Array(compiled.epgAngles.length);
    this.epgFired = new Uint8Array(compiled.epgAngles.length);
    this.elig = new Float32Array(groups.kc.length);
    // Learning is per fly, so each one gets its own copy of the weights.
    // A typed-array copy of the whole connectome is a memcpy; rebuilding
    // the adjacency per fly, which is what this replaces, was not.
    this.w = new Float32Array(compiled.wBase);
    this.plDirty = new Uint8Array(compiled.plSlot.length);
    this.dirtyList = new Uint32Array(compiled.plSlot.length);
    this.ascendPhase = Float32Array.from({ length: groups.ascend.length }, () =>
      rng.range(0, TWO_PI)
    );
    // Baselines are shared except in the interneuron pool, where each fly
    // gets its own spread — that jitter is what makes two flies carrying
    // identical wiring behave like two different animals.
    this.baseline = new Float32Array(compiled.baselineTemplate);
    compiled.jitteredBaseline.forEach((i) => {
      this.baseline[i] = rng.range(0.01, 0.07);
    });
    this.sb = new Float32Array(n);
    this.inhQueue = Array.from(
      { length: INH_SLOTS },
      () => new Float32Array(n)
    );
    this.inhTouched = Array.from(
      { length: INH_SLOTS },
      () => new Int32Array(n)
    );
    this.inhCount = new Int32Array(INH_SLOTS);

    // Seed the compass: kick one arc of the ring so a bump condenses there.
    // Each fly's bump starts somewhere different — the offset never matters
    // (path integration only needs consistency), the attractor does.
    if (groups.epg.length > 0) {
      const theta = rng.range(-Math.PI, Math.PI);
      const { epgAngles } = compiled;
      const arc: number[] = [];

      groups.epg.forEach((i, k) => {
        if (Math.cos(epgAngles[k] - theta) > 0.4) arc.push(i);
      });

      this.stimulate(arc, 0.1, 250);
    }
  }

  public get neuronCount(): number {
    return this.n;
  }

  public getGroups(): Groups {
    return this.c.groups;
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
    indices: Int32Array | number[],
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

  /**
   * Dopamine-gated depression of recently-active KC->MBON synapses, per
   * compartment: punishment (PPL1) depresses approach-MBON inputs so the
   * taught pattern reads as avoidance; reward (PAM) does the mirror-image.
   * Untouched synapses slowly recover toward their naive weight.
   */
  private applyPlasticity(): void {
    const punish = Math.min(this.punishAcc / DAN_NORM, 1);
    const reward = Math.min(this.rewardAcc / DAN_NORM, 1);
    const { elig, eligScale: scale, w } = this;
    const { plAvd, plBase, plKc, plSlot } = this.c;

    // Dopamine is the rare event: a fly gets a punishment or reward pulse
    // every few seconds at most, and only then does any synapse change. The
    // rest of the time this is pure recovery, and recovery only concerns
    // synapses that were actually depressed — a few hundred, not all 27,000.
    if (punish > 0.05 || reward > 0.05) {
      // eslint-disable-next-line unicorn/no-for-loop
      for (let e = 0; e < plSlot.length; e += 1) {
        const drive = plAvd[e] === 1 ? reward : punish;

        if (drive > 0.05) {
          const el = elig[plKc[e]] * scale;

          if (el > 0.3) {
            const slot = plSlot[e];
            const base = plBase[e];

            w[slot] = Math.max(
              w[slot] * (1 - MB_LEARN_RATE * drive * el),
              base * MB_W_FLOOR
            );
            if (this.plDirty[e] === 0) {
              this.plDirty[e] = 1;
              this.dirtyList[this.dirtyCount] = e;
              this.dirtyCount += 1;
            }
          }
        }
      }
    }

    // Recovery, over the depressed set only. A synapse that has crept back
    // to its naive weight is snapped there and dropped from the set.
    const { dirtyList, plDirty } = this;
    let live = 0;

    for (let d = 0; d < this.dirtyCount; d += 1) {
      const e = dirtyList[d];
      const slot = plSlot[e];
      const base = plBase[e];
      const next = w[slot] + (base - w[slot]) * MB_RECOVER;

      if (Math.abs(base - next) < Math.abs(base) * 1e-4) {
        w[slot] = base;
        plDirty[e] = 0;
      } else {
        w[slot] = next;
        dirtyList[live] = e;
        live += 1;
      }
    }
    this.dirtyCount = live;
  }

  /**
   * Fold the running decay factor back into the stored traces. Happens
   * roughly once a minute of simulated time, not once a millisecond.
   */
  private renormaliseEligibility(): void {
    const { elig, eligScale } = this;

    for (let k = 0; k < elig.length; k += 1) elig[k] *= eligScale;
    this.eligScale = 1;
  }

  /** Eligibility of the Kenyon cell at ordinal `k` in `groups.kc`, 0..1. */
  public eligibility(k: number): number {
    return this.elig[k] * this.eligScale;
  }

  private stepOneMs(): void {
    this.simMs += 1;

    const now = this.simMs;

    // Usually empty; filtering unconditionally allocated a fresh array every
    // millisecond of every fly's life.
    if (this.stims.some(({ untilMs }) => now >= untilMs)) {
      this.stims = this.stims.filter(({ untilMs }) => now < untilMs);
    }

    if (now >= this.burstNext) {
      this.burstUntil = now + BURST_MS;
      this.burstNext =
        now + this.rng.rangeInt(BURST_GAP_MIN_MS, BURST_GAP_MAX_MS);
    }

    const { inputs, n, refr, rng, sb, v } = this;
    const p =
      (now < this.burstUntil ? P_NOISE * BURST_NOISE_FACTOR : P_NOISE) *
      inputs.activityScale;
    const scale = inputs.activityScale;

    if (scale !== this.sbScale) {
      const { baseline } = this;

      for (let i = 0; i < n; i += 1) sb[i] = baseline[i] * scale;
      this.sbScale = scale;
    }

    // The leak/baseline pass for THIS millisecond ran fused with the
    // previous millisecond's threshold scan (see below) — except for the
    // very first millisecond of the fly's life, which has no pass behind
    // it and gets a plain one here.
    if (now === 1) {
      for (let i = 0; i < n; i += 1) {
        if (refr[i] > 0) {
          refr[i] -= 1;
          v[i] *= DECAY;
        } else {
          v[i] = v[i] * DECAY + sb[i];
        }
      }
    }

    // Spontaneous depolarisations: the same per-neuron Bernoulli(p), drawn
    // as geometric gaps between hits — ~n*p draws instead of n.
    if (p > 0) {
      const { noiseExempt } = this.c;
      const lnq = Math.log(1 - p);
      let i = Math.floor(Math.log(1 - rng.float()) / lnq);

      while (i < n) {
        if (refr[i] <= 0 && noiseExempt[i] === 0) v[i] += NOISE_KICK;
        i += 1 + Math.floor(Math.log(1 - rng.float()) / lnq);
      }
    }

    // Sensory drive.
    const { groups } = this.c;

    if (inputs.loomL > 0.001) {
      const d = inputs.loomL * LOOM_GAIN * inputs.sensoryGate;

      groups.loomLeft.forEach((i) => {
        v[i] += d;
      });
    }
    if (inputs.loomR > 0.001) {
      const d = inputs.loomR * LOOM_GAIN * inputs.sensoryGate;

      groups.loomRight.forEach((i) => {
        v[i] += d;
      });
    }
    // Body to brain: gait rhythm into the ascending proprioceptive neurons,
    // and forward speed into the PFN vector cells (their real translational
    // velocity input), whose heading-frame context arrives through the real
    // Delta7/EPG wiring.
    if (inputs.gaitDrive > 0.001) {
      const ph = inputs.gaitPhase * TWO_PI;

      groups.ascend.forEach((i, k) => {
        v[i] +=
          inputs.gaitDrive *
          0.09 *
          (0.5 + 0.5 * Math.sin(ph + this.ascendPhase[k]));
      });

      const pfnDrive = inputs.gaitDrive * 0.02;

      groups.pfn.forEach((i) => {
        v[i] += pfnDrive;
      });
    }
    if (inputs.airPuff > 0.001) {
      const d = inputs.airPuff * 0.12 * inputs.sensoryGate;

      groups.sens.forEach((i) => {
        v[i] += d;
      });
    }
    // Self-motion into the compass: turning excites the PEN population on
    // the turn side and suppresses the other (push-pull, as in the real
    // system), which drags the EPG bump around the ring with the body.
    if (Math.abs(inputs.rotation) > 0.001) {
      const d =
        Math.min(Math.abs(inputs.rotation), ROT_MAX) *
        ROT_GAIN *
        inputs.activityScale;
      // Group choice calibrated against the recovered ring: driving the
      // "retard" shifters advances the readout angle in this wiring.
      const turn = inputs.rotation > 0 ? groups.penR : groups.penL;
      const other = inputs.rotation > 0 ? groups.penL : groups.penR;

      turn.forEach((i) => {
        v[i] += d;
      });
      other.forEach((i) => {
        v[i] = Math.max(v[i] - d * 0.6, V_FLOOR);
      });
    }
    // Small moving objects into LC11, per eye; the courtship target into
    // LC10a — driven exactly like the loom populations.
    if (inputs.smallObjL > 0.001) {
      const d = inputs.smallObjL * SMALL_OBJ_GAIN * inputs.sensoryGate;

      groups.lc11L.forEach((i) => {
        v[i] += d;
      });
    }
    if (inputs.smallObjR > 0.001) {
      const d = inputs.smallObjR * SMALL_OBJ_GAIN * inputs.sensoryGate;

      groups.lc11R.forEach((i) => {
        v[i] += d;
      });
    }
    // Mushroom body housekeeping: eligibility traces fade, dopamine
    // accumulators decay, and every 50 ms the plastic synapses learn.
    this.eligScale *= ELIG_DECAY;
    if (this.eligScale < ELIG_RENORM) this.renormaliseEligibility();
    this.punishAcc *= DAN_ACCUM_DECAY;
    this.rewardAcc *= DAN_ACCUM_DECAY;
    if (now % MB_PLAST_INTERVAL_MS === 0) this.applyPlasticity();
    this.stims.forEach(({ idx, strength }) => {
      idx.forEach((i) => {
        v[i] += strength;
      });
    });

    // Deliver the inhibition scheduled for this millisecond. Only the
    // handful of neurons an inhibitory spike actually reached are touched:
    // the senders recorded them, so this costs a couple of hundred writes
    // instead of a scan of the whole brain.
    const slot = this.inhQueue[this.qHead];
    const touched = this.inhTouched[this.qHead];
    const nTouched = this.inhCount[this.qHead];

    for (let t = 0; t < nTouched; t += 1) {
      const i = touched[t];

      if (slot[i] !== 0) {
        v[i] = Math.max(v[i] + slot[i], V_FLOOR);
        slot[i] = 0;
      }
    }
    this.inhCount[this.qHead] = 0;

    // Threshold for THIS millisecond, fused with leak/baseline/adaptation
    // for the NEXT one — a single scan of the population instead of two,
    // and the scan is the sim's dominant fixed cost. The fusion is exact:
    // everything that lands on a neuron after its decay (the propagation
    // below) is prescaled by DECAY to compensate, and a spiking neuron
    // leaves this pass with its post-spike state already decayed once
    // (v = 0, refractory count down one, adaptation kick aged one step),
    // which is precisely where the old separate decay pass left it.
    //
    // Two paths over the same arithmetic: adaptation only exists on the
    // looming detectors for a few hundred ms after they fire, so most of
    // the time the loop can drop the extra load and branch per neuron.
    const { isLoomNeuron } = this.c;
    const { adapt, spiked } = this;
    let count = 0;

    if (this.adaptLive) {
      let live = 0;

      for (let i = 0; i < n; i += 1) {
        if (refr[i] > 0) {
          refr[i] -= 1;
          v[i] *= DECAY;
          if (adapt[i] > 0.0001) {
            adapt[i] *= ADAPT_DECAY;
            live += 1;
          }
        } else if (v[i] >= THRESHOLD) {
          v[i] = 0;
          refr[i] = REFRACTORY_MS - 1;
          if (isLoomNeuron[i] === 1) {
            adapt[i] = (adapt[i] + ADAPT_KICK) * ADAPT_DECAY;
            live += 1;
          } else if (adapt[i] > 0.0001) {
            adapt[i] *= ADAPT_DECAY;
            live += 1;
          }
          spiked[count] = i;
          count += 1;
        } else {
          let vi = v[i] * DECAY + sb[i];

          if (adapt[i] > 0.0001) {
            vi -= adapt[i];
            adapt[i] *= ADAPT_DECAY;
            live += 1;
          }
          v[i] = vi;
        }
      }
      if (live === 0) this.adaptLive = false;
    } else {
      for (let i = 0; i < n; i += 1) {
        if (refr[i] > 0) {
          refr[i] -= 1;
          v[i] *= DECAY;
        } else if (v[i] >= THRESHOLD) {
          v[i] = 0;
          refr[i] = REFRACTORY_MS - 1;
          if (isLoomNeuron[i] === 1) {
            adapt[i] = (adapt[i] + ADAPT_KICK) * ADAPT_DECAY;
            this.adaptLive = true;
          }
          spiked[count] = i;
          count += 1;
        } else {
          v[i] = v[i] * DECAY + sb[i];
        }
      }
    }
    this.spikeCount = count;

    // Propagate: excitation lands immediately, inhibition is queued along
    // with the index it landed on, so delivery above stays sparse.
    const inhAt = (this.qHead + INH_DELAY_MS) % INH_SLOTS;
    const inhSlot = this.inhQueue[inhAt];
    const inhList = this.inhTouched[inhAt];
    const { colIdx, imm, rowStart } = this.c;
    const { w } = this;
    let inhN = this.inhCount[inhAt];

    // Excitation lands after the fused pass already decayed its targets, so
    // it carries one DECAY of its own: (v + w) * DECAY + b written as
    // v * DECAY + b + w * DECAY — identical physics, no extra scan. The same
    // holds for immediate (compass-ring) inhibition, whose floor becomes
    // V_FLOOR * DECAY + baseline: where the old code clamped and then
    // decayed, this clamps at the decayed image of the same floor. Positive
    // weights need no clamp at all — the voltage is never below the floor
    // when they land. Queued inhibition is delivered before the fused pass
    // and is untouched.
    const floorD = V_FLOOR * DECAY;

    for (let s = 0; s < count; s += 1) {
      const i = spiked[s];
      const end = rowStart[i + 1];

      for (let k = rowStart[i]; k < end; k += 1) {
        const j = colIdx[k];
        const weight = w[k];

        if (weight >= 0) {
          v[j] += weight * DECAY;
        } else if (imm[k] === 1) {
          v[j] = Math.max(v[j] + weight * DECAY, floorD + sb[j]);
        } else {
          if (inhSlot[j] === 0 && inhN < n) {
            inhList[inhN] = j;
            inhN += 1;
          }
          inhSlot[j] += weight;
        }
      }
    }
    this.inhCount[inhAt] = inhN;
    this.qHead = (this.qHead + 1) % INH_SLOTS;

    this.updateRates();
  }

  /**
   * The compass reading: the population vector of the EPG ring's smoothed
   * rates. `strength` is the bump's coherence — near 0 when activity is
   * spread around the ring, near 1 for a single tight bump.
   */
  public compass(): { angle: number; strength: number } {
    let x = 0;
    let y = 0;
    let total = 0;

    const { epgAngles } = this.c;

    for (let k = 0; k < this.epgRate.length; k += 1) {
      const r = this.epgRate[k];

      x += Math.cos(epgAngles[k]) * r;
      y += Math.sin(epgAngles[k]) * r;
      total += r;
    }

    return {
      angle: Math.atan2(y, x),
      strength: total > 1 ? Math.hypot(x, y) / total : 0,
    };
  }

  private updateRates(): void {
    let cLoom = 0;
    let cLoomL = 0;
    let cLoomR = 0;
    let cDl = 0;
    let cDr = 0;
    let cM = 0;
    let cF = 0;
    let cG = 0;
    let cW = 0;
    let cLc11L = 0;
    let cLc11R = 0;
    let cMbApp = 0;
    let cMbAvd = 0;
    let cKc = 0;
    const { dnaIsLeft, epgIndexOf, kcIndexOf, roles, sides } = this.c;
    const { epgFired, spiked } = this;
    const count = this.spikeCount;

    epgFired.fill(0);
    for (let s = 0; s < count; s += 1) {
      const i = spiked[s];
      const epgK = epgIndexOf[i];

      if (epgK >= 0) epgFired[epgK] = 1;
      switch (roles[i] as Role) {
        case Role.Lc4:
        case Role.Lc6:
        case Role.Lc16:
        case Role.Lplc2:
          cLoom += 1;
          if (sides[i] === Side.Left) cLoomL += 1;
          else cLoomR += 1;
          break;
        case Role.Dna01:
        case Role.Dna02:
          if (dnaIsLeft[i] === 1) cDl += 1;
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
        case Role.Lc11:
          if (sides[i] === Side.Left) cLc11L += 1;
          else cLc11R += 1;
          break;
        case Role.Kc: {
          // A spiking KC tags its synapses as teachable for a few seconds.
          // Eligibility accumulates over sustained firing, so a KC that is
          // genuinely part of the presented pattern saturates while one
          // recruited by a stray spike stays below the learning threshold.
          const kcK = kcIndexOf[i];

          cKc += 1;
          if (kcK >= 0) {
            const inv = 1 / this.eligScale;

            this.elig[kcK] = Math.min(this.elig[kcK] + 0.15 * inv, inv);
          }
          break;
        }
        case Role.Mbon:
          if (sides[i] === Side.Right) cMbAvd += 1;
          else cMbApp += 1;
          break;
        case Role.Ppl1:
          this.punishAcc += 1;
          break;
        case Role.Pam:
          this.rewardAcc += 1;
          break;
        default:
          break;
      }
    }

    const { rates } = this;
    const { groups } = this.c;
    const nLoom = groups.loomLeft.length + groups.loomRight.length;

    rates.loom = ema(rates.loom, hz(cLoom, nLoom));
    rates.loomLeft = ema(rates.loomLeft, hz(cLoomL, groups.loomLeft.length));
    rates.loomRight = ema(rates.loomRight, hz(cLoomR, groups.loomRight.length));
    rates.dnaL = ema(rates.dnaL, hz(cDl, groups.dnaL.length));
    rates.dnaR = ema(rates.dnaR, hz(cDr, groups.dnaR.length));
    rates.mdn = ema(rates.mdn, hz(cM, groups.mdn.length));
    rates.fwd = ema(rates.fwd, hz(cF, groups.fwd.length));
    rates.groom = ema(rates.groom, hz(cG, groups.groom.length));
    rates.escw = ema(rates.escw, hz(cW, groups.escw.length));
    rates.lc11 = ema(
      rates.lc11,
      hz(cLc11L + cLc11R, groups.lc11L.length + groups.lc11R.length)
    );
    rates.lc11L = ema(rates.lc11L, hz(cLc11L, groups.lc11L.length));
    rates.lc11R = ema(rates.lc11R, hz(cLc11R, groups.lc11R.length));
    rates.mbApp = ema(rates.mbApp, hz(cMbApp, groups.mbonApp.length));
    rates.mbAvd = ema(rates.mbAvd, hz(cMbAvd, groups.mbonAvd.length));
    rates.pop = ema(rates.pop, hz(count, this.n));
    rates.central = ema(
      rates.central,
      hz(count - cKc, this.n - groups.kc.length)
    );

    // Per-EPG rates for the bump readout, smoothed a little faster than the
    // group EMAs so the compass tracks turns without lagging behind them.
    for (let k = 0; k < this.epgRate.length; k += 1) {
      this.epgRate[k] +=
        ((epgFired[k] === 1 ? 1000 : 0) - this.epgRate[k]) / 60;
    }
  }
}
