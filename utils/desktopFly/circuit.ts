// The circuit: real FlyWire v783 neurons and real signed synapse weights,
// loaded from `circuit.json` (see DATA_LICENSE.md alongside it). Ported from
// gnat's `circuit.rs` / DesktopFly's `Sim.swift` (MIT).

export const Role = {
  Dna01: 3,
  Dna02: 4,
  /** DNg11 — grooming command. */
  Dng11: 7,
  /** DNp09 — forward-walking command. */
  Dnp09: 6,
  /** DNp02/04/11 — loom-responsive escape-manoeuvre (wing) DNs. */
  Escw: 8,
  /** DNp01, the giant fibre. The escape command neuron. */
  Gf: 2,
  /** LC16 — loom-sensitive, drives backward retreat (Wu et al. 2016). */
  Lc16: 11,
  Lc4: 0,
  /** LC6 — loom-sensitive, escape-promoting (Wu et al. 2016). */
  Lc6: 10,
  Lplc2: 1,
  /** MDN, the moonwalker: backward walking. */
  Mdn: 5,
  Other: 9,
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
  cellType: string;
  role: Role;
  side: Side;
};

export type Circuit = {
  /** `[pre, post, signed synapse count]`, before any weight scaling. */
  edges: [number, number, number][];
  neurons: Neuron[];
};

type RawNeuron = {
  role: string;
  side: string;
  type: string;
};

type RawCircuit = {
  edges: [number, number, number][];
  neurons: RawNeuron[];
};

const parseRole = (role: string): Role => {
  switch (role) {
    case "lc4":
      return Role.Lc4;
    case "lc6":
      return Role.Lc6;
    case "lc16":
      return Role.Lc16;
    case "lplc2":
      return Role.Lplc2;
    case "gf":
      return Role.Gf;
    case "dna01":
      return Role.Dna01;
    case "dna02":
      return Role.Dna02;
    case "mdn":
      return Role.Mdn;
    case "dnp09":
      return Role.Dnp09;
    case "dng11":
      return Role.Dng11;
    case "escw":
      return Role.Escw;
    default:
      return Role.Other;
  }
};

const parseSide = (side: string): Side => {
  switch (side) {
    case "left":
      return Side.Left;
    case "right":
      return Side.Right;
    default:
      return Side.Center;
  }
};

/** Whether this population drives the giant fibre through gap junctions. */
export const isLooming = (role: Role): boolean =>
  role === Role.Lc4 || role === Role.Lplc2;

export const parseCircuit = (raw: RawCircuit): Circuit => {
  const neurons = raw.neurons.map(({ role, side, type }) => ({
    cellType: type,
    role: parseRole(role),
    side: parseSide(side),
  }));
  const count = neurons.length;
  const edges = raw.edges.filter(
    ([pre, post]) => pre >= 0 && pre < count && post >= 0 && post < count
  );

  return { edges, neurons };
};

export const loadCircuit = async (url: string): Promise<Circuit> => {
  const response = await fetch(url);

  return parseCircuit((await response.json()) as RawCircuit);
};
