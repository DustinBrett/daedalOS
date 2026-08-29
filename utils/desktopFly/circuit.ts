// The circuit: real FlyWire v783 neurons and real signed synapse weights,
// packed by etl3.py into a compact binary (`circuit.bin`) — 5 bytes per
// neuron, 6 per edge — so a floppy's worth of file holds a few hundred
// thousand synapses. See DATA_LICENSE.md alongside the data.
// Ported from gnat's `circuit.rs` / DesktopFly's `Sim.swift` (MIT).

export const Role = {
  /** Delta7 — bump-shaping inhibition across the compass ring. */
  Delta7: 14,
  Dna01: 3,
  Dna02: 4,
  /** DNg11 — grooming command. */
  Dng11: 7,
  /** DNp09 — forward-walking command. */
  Dnp09: 6,
  /** EPG — the compass: a ring attractor whose bump is the heading. */
  Epg: 12,
  /** DNp02/04/11 — loom-responsive escape-manoeuvre (wing) DNs. */
  Escw: 8,
  /** DNp01, the giant fibre. The escape command neuron. */
  Gf: 2,
  /**
   * hDeltaB — fan-shaped-body integrators of the PFN vectors into a
   * traveling direction (Lyu, Abbott & Maimon 2022).
   */
  Hdb: 25,
  /** Kenyon cells — the mushroom body's sparse stimulus code. */
  Kc: 18,
  /**
   * LC10a — small-target visual projection neurons, present with their
   * real wiring. Their courtship-pursuit role lives in the male brain;
   * FAFB is a female's, so no such behaviour is modelled.
   */
  Lc10a: 16,
  /** LC11 — small-moving-object detector (other flies, a distant cursor). */
  Lc11: 17,
  /** LC16 — loom-sensitive, drives backward retreat (Wu et al. 2016). */
  Lc16: 11,
  Lc4: 0,
  /** LC6 — loom-sensitive, escape-promoting (Wu et al. 2016). */
  Lc6: 10,
  Lplc2: 1,
  /** APL/DPM — mushroom body sparsening and consolidation interneurons. */
  Mbaux: 22,
  /**
   * Mushroom body output neurons; side byte = dopamine compartment
   * (0 = PPL1/punishment, whose MBONs drive approach; 1 = PAM/reward).
   */
  Mbon: 19,
  /** MDN, the moonwalker: backward walking. */
  Mdn: 5,
  Other: 9,
  /** PAM — reward dopamine neurons gating appetitive MB plasticity. */
  Pam: 21,
  /** PEG — protocerebral bridge/EB recurrence stabilising the bump. */
  Peg: 15,
  /** PEN — rotation shifters that move the compass bump as the fly turns. */
  Pen: 13,
  /**
   * PFNd/PFNv — heading-conjunctive translational-velocity cells, the
   * inputs to the fan-shaped body's traveling-direction vector.
   */
  Pfn: 24,
  /**
   * Antennal-lobe projection neurons — the mushroom body's input layer.
   * Stimuli are presented as PN combinations; the sparse KC code emerges
   * through their real claws (Litwin-Kumar et al. 2017).
   */
  Pn: 23,
  /** PPL1 — punishment dopamine neurons gating aversive MB plasticity. */
  Ppl1: 20,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Role = (typeof Role)[keyof typeof Role];

export const Side = {
  Center: 2,
  Left: 0,
  Right: 1,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Side = (typeof Side)[keyof typeof Side];

export type Neuron = {
  /**
   * Ring coordinate in radians for compass cells (EPG wedge position,
   * recovered spectrally from the wiring; PEN input locus). Undefined for
   * every other neuron.
   */
  angle?: number;
  cellType: string;
  role: Role;
  side: Side;
};

/**
 * The decoded wiring. Edges live in parallel typed arrays rather than an
 * array of `[pre, post, syn]` tuples: at 136k edges the tuple form allocates
 * a six-figure count of heap objects, and every pass over the wiring then
 * chases pointers instead of walking flat memory. De-interleaving the file's
 * packed records into three arrays costs one linear scan and makes every
 * later pass — the CSR build above all — sequential. That headroom is what
 * lets more of the brain fit in the same file and the same frame budget.
 */
export type Circuit = {
  edgeCount: number;
  /** Postsynaptic neuron index per edge. */
  edgePost: Uint16Array;
  /** Presynaptic neuron index per edge. */
  edgePre: Uint16Array;
  /** Signed synapse count per edge, before any weight scaling. */
  edgeSyn: Int16Array;
  neurons: Neuron[];
};

const MAGIC = 0x464c5943; // "FLYC" big-endian
const HEADER_BYTES = 12;
/** Bytes per neuron record, indexed by format version. */
const NEURON_BYTES = [0, 5];
const EDGE_BYTES = 6;
const NO_ANGLE = 0x7fff;

const CLASS_NAMES = ["other", "sensory", "ascending"];

/** Whether this population drives the giant fibre through gap junctions. */
export const isLooming = (role: Role): boolean =>
  role === Role.Lc4 || role === Role.Lplc2;

/** Whether this neuron belongs to the central-complex compass circuit. */
export const isCompass = (role: Role): boolean =>
  role === Role.Epg ||
  role === Role.Pen ||
  role === Role.Delta7 ||
  role === Role.Peg;

export const decodeCircuit = (buffer: ArrayBuffer): Circuit => {
  const view = new DataView(buffer);

  if (view.getUint32(0, false) !== MAGIC) {
    throw new Error("desktop-fly: bad circuit magic");
  }

  const version = view.getUint8(4);
  const stride = NEURON_BYTES[version];

  if (!stride) {
    throw new Error(`desktop-fly: unsupported circuit format ${version}`);
  }

  const neuronCount = view.getUint16(6, true);
  const edgeCount = view.getUint32(8, true);
  const neurons: Neuron[] = [];
  let offset = HEADER_BYTES;

  for (let i = 0; i < neuronCount; i += 1) {
    const role = view.getUint8(offset) as Role;
    const side = view.getUint8(offset + 1) as Side;
    const cellClass = view.getUint8(offset + 2);
    const rawAngle = view.getInt16(offset + 3, true);

    neurons.push({
      ...(rawAngle === NO_ANGLE ? {} : { angle: rawAngle / 10_000 }),
      cellType: CLASS_NAMES[cellClass] ?? "other",
      role,
      side,
    });
    offset += stride;
  }

  // The edge block is `[u16 pre][u16 post][i16 syn]` little-endian, which is
  // already the in-memory layout of a strided Uint16Array/Int16Array pair.
  // Typed arrays need 2-byte alignment, so when the neuron block leaves the
  // edge block on an odd offset (an odd neuron count) copy it into place;
  // otherwise read it where it lies.
  const aligned =
    offset % 2 === 0
      ? buffer
      : buffer.slice(offset, offset + edgeCount * EDGE_BYTES);
  const base = aligned === buffer ? offset : 0;
  const words = new Uint16Array(aligned, base, edgeCount * 3);
  const signed = new Int16Array(aligned, base, edgeCount * 3);
  const edgePre = new Uint16Array(edgeCount);
  const edgePost = new Uint16Array(edgeCount);
  const edgeSyn = new Int16Array(edgeCount);

  for (let i = 0, k = 0; i < edgeCount; i += 1, k += 3) {
    edgePre[i] = words[k];
    edgePost[i] = words[k + 1];
    edgeSyn[i] = signed[k + 2];
  }

  return { edgeCount, edgePost, edgePre, edgeSyn, neurons };
};

export const loadCircuit = async (url: string): Promise<Circuit> => {
  const response = await fetch(url);

  return decodeCircuit(await response.arrayBuffer());
};
