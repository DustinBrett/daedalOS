/* eslint-disable no-bitwise */
// Deterministic xoshiro128++ PRNG, ported from gnat's `rng.rs` (MIT).
// Seeded explicitly so multiple flies don't all wander identically.

const splitMix32 = (seed: number): (() => number) => {
  let z = seed >>> 0;

  return () => {
    z = (z + 0x9e3779b9) >>> 0;

    let x = z;

    x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
    x = Math.imul(x ^ (x >>> 15), 0x735a2d97);

    return (x ^ (x >>> 15)) >>> 0;
  };
};

const rotl = (x: number, k: number): number =>
  ((x << k) | (x >>> (32 - k))) >>> 0;

export class Rng {
  private s: [number, number, number, number];

  public constructor(seed: number) {
    const next = splitMix32(seed);

    this.s = [next(), next(), next(), next()];
    if (this.s.every((word) => word === 0)) this.s[0] = 1;
  }

  public nextU32(): number {
    const { s } = this;
    const result = (rotl((s[0] + s[3]) >>> 0, 7) + s[0]) >>> 0;
    const t = (s[1] << 9) >>> 0;

    s[2] = (s[2] ^ s[0]) >>> 0;
    s[3] = (s[3] ^ s[1]) >>> 0;
    s[1] = (s[1] ^ s[2]) >>> 0;
    s[0] = (s[0] ^ s[3]) >>> 0;
    s[2] = (s[2] ^ t) >>> 0;
    s[3] = rotl(s[3], 11);

    return result;
  }

  /** Uniform in `[0, 1)`. */
  public float(): number {
    return (this.nextU32() >>> 8) / 16_777_216;
  }

  /** Uniform in `[lo, hi)`. */
  public range(lo: number, hi: number): number {
    return lo + this.float() * (hi - lo);
  }

  /** Uniform integer in `[lo, hi]`. */
  public rangeInt(lo: number, hi: number): number {
    return lo + (this.nextU32() % (hi - lo + 1));
  }
}
