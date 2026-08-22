import { readFileSync } from "fs";
import { join } from "path";
import { Role, Side, parseCircuit } from "utils/desktopFly/circuit";
import { Fly, FlyState } from "utils/desktopFly/fly";
import { Lif } from "utils/desktopFly/lif";
import { drawFly } from "utils/desktopFly/render";
import { Rng } from "utils/desktopFly/rng";
import { SignalBuilder, circadianActivity } from "utils/desktopFly/signals";
import { getLedges, ledgesToScene } from "utils/desktopFly/terrain";

const loadRealCircuit = (): ReturnType<typeof parseCircuit> =>
  parseCircuit(
    JSON.parse(
      readFileSync(
        join(process.cwd(), "public/Program Files/DesktopFly/circuit.json"),
        "utf8"
      )
    ) as Parameters<typeof parseCircuit>[0]
  );

const DT = 1 / 60;
const BOUNDS = { x: 1920, y: 1080 };
const SLEEP_OFF = {
  arousal: 0,
  backward: false,
  escape: false,
  groomDrive: 0,
  nervous: 0,
  sleep: false,
  tempo: 1,
  turnBias: 0,
  walkDrive: 0,
  wingDrive: 0,
};

describe("desktopFly rng", () => {
  it("is reproducible from a seed", () => {
    const a = new Rng(7);
    const b = new Rng(7);

    Array.from({ length: 64 }).forEach(() =>
      expect(a.nextU32()).toBe(b.nextU32())
    );
  });

  it("diverges across seeds", () =>
    expect(new Rng(1).nextU32()).not.toBe(new Rng(2).nextU32()));

  it("draws floats uniformly in [0, 1)", () => {
    const rng = new Rng(99);
    let sum = 0;

    Array.from({ length: 10_000 }).forEach(() => {
      const x = rng.float();

      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      sum += x;
    });
    expect(Math.abs(sum / 10_000 - 0.5)).toBeLessThan(0.02);
  });

  it("draws inclusive integer ranges", () => {
    const rng = new Rng(5);
    const seen = new Set<number>();

    Array.from({ length: 5000 }).forEach(() => {
      const value = rng.rangeInt(3, 6);

      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(6);
      seen.add(value);
    });
    expect(seen.size).toBe(4);
  });
});

describe("desktopFly circadian curve", () => {
  it("has night and siesta dips, dawn and dusk peaks", () => {
    expect(circadianActivity(3)).toBeLessThan(0.4);
    expect(circadianActivity(9)).toBeGreaterThan(0.9);
    expect(circadianActivity(14)).toBeGreaterThanOrEqual(0.3);
    expect(circadianActivity(14)).toBeLessThanOrEqual(0.7);
    expect(circadianActivity(18)).toBeGreaterThan(0.9);
  });

  it("is defined across the whole day", () =>
    Array.from({ length: 241 }).forEach((_, index) => {
      const value = circadianActivity(index / 10);

      expect(value).toBeGreaterThanOrEqual(0.2);
      expect(value).toBeLessThanOrEqual(1);
    }));

  it("falls back to the night floor out of range", () => {
    expect(circadianActivity(-1)).toBe(0.25);
    expect(circadianActivity(25)).toBe(0.25);
  });
});

describe("desktopFly circuit", () => {
  const sample = {
    edges: [
      [0, 1, 12],
      [2, 1, -8],
    ] as [number, number, number][],
    neurons: [
      { role: "lc4", side: "left", type: "LC4" },
      { role: "gf", side: "center", type: "DNp01" },
      { role: "dnp99", side: "dorsal", type: "ascending" },
    ],
  };

  it("parses the upstream shape", () => {
    const circuit = parseCircuit(sample);

    expect(circuit.neurons).toHaveLength(3);
    expect(circuit.neurons[0].role).toBe(Role.Lc4);
    expect(circuit.neurons[0].side).toBe(Side.Left);
    expect(circuit.neurons[1].role).toBe(Role.Gf);
    expect(circuit.edges).toEqual([
      [0, 1, 12],
      [2, 1, -8],
    ]);
  });

  it("maps unknown roles and sides to fallbacks", () => {
    const circuit = parseCircuit(sample);

    expect(circuit.neurons[2].role).toBe(Role.Other);
    expect(circuit.neurons[2].side).toBe(Side.Center);
  });

  it("drops out-of-range edges", () => {
    const circuit = parseCircuit({
      ...sample,
      edges: [
        [0, 99, 12],
        [0, 1, 5],
      ] as [number, number, number][],
    });

    expect(circuit.edges).toEqual([[0, 1, 5]]);
  });

  it("loads the real FlyWire circuit with the expected populations", () => {
    const circuit = loadRealCircuit();

    expect(circuit.neurons).toHaveLength(1275);
    expect(circuit.edges).toHaveLength(60_818);

    const groups = new Lif(circuit, 42).getGroups();

    // LC4 (104) + LPLC2 (210) + LC6 (125) + LC16 (152).
    expect(groups.loomLeft.length + groups.loomRight.length).toBe(591);
    expect(groups.gf).toHaveLength(2);
    expect(groups.dnaL).toHaveLength(2);
    expect(groups.dnaR).toHaveLength(2);
    expect(groups.mdn).toHaveLength(4);
    expect(groups.fwd).toHaveLength(2);
    expect(groups.groom).toHaveLength(6);
    expect(groups.escw).toHaveLength(6);
    expect(groups.ascend.length).toBeGreaterThan(0);
    expect(groups.sens.length).toBeGreaterThan(0);
  });

  it("parses the LC6 and LC16 loom populations", () => {
    const circuit = parseCircuit({
      edges: [],
      neurons: [
        { role: "lc6", side: "left", type: "LC6" },
        { role: "lc16", side: "right", type: "LC16" },
      ],
    });

    expect(circuit.neurons[0].role).toBe(Role.Lc6);
    expect(circuit.neurons[1].role).toBe(Role.Lc16);
  });
});

describe("desktopFly LIF simulation", () => {
  const circuit = loadRealCircuit();

  it("keeps the giant fibre silent at rest", () => {
    const sim = new Lif(circuit, 42);

    sim.step(4000);
    expect(sim.consumeGf()).toBe(false);
    // The rest of the network crackles: rates are alive, not seizing.
    expect(sim.getRates().pop).toBeGreaterThan(0.5);
    expect(sim.getRates().pop).toBeLessThan(50);
  });

  it("fires the giant fibre quickly on an abrupt loom, then stops", () => {
    const sim = new Lif(circuit, 42);

    sim.step(3000);
    sim.consumeGf();

    let latencyMs = -1;
    let gfSpikes = 0;
    let peakLoomRate = 0;

    sim.inputs.loomL = 1;
    sim.inputs.loomR = 0.5;
    Array.from({ length: 400 }).forEach((_, ms) => {
      sim.step(1);
      if (sim.consumeGf()) {
        gfSpikes += 1;
        if (latencyMs < 0) latencyMs = ms;
      }
      peakLoomRate = Math.max(peakLoomRate, sim.getRates().loom);
    });

    expect(latencyMs).toBeGreaterThanOrEqual(0);
    expect(latencyMs).toBeLessThan(50);
    expect(peakLoomRate).toBeGreaterThan(5);
    // A real giant fibre fires a short onset volley, not a tonic storm:
    // the adapting loom detectors shut the drive down after takeoff.
    expect(gfSpikes).toBeGreaterThanOrEqual(1);
    expect(gfSpikes).toBeLessThanOrEqual(30);
  });

  it("adapts to a sustained loom the way phasic LC neurons do", () => {
    const sim = new Lif(circuit, 42);

    sim.step(2000);

    let peakEarly = 0;

    sim.inputs.loomL = 0.5;
    sim.inputs.loomR = 0.5;
    Array.from({ length: 400 }).forEach(() => {
      sim.step(1);
      peakEarly = Math.max(peakEarly, sim.getRates().loom);
    });
    // Two more seconds of the same stimulus: the response habituates.
    sim.step(2000);
    expect(sim.getRates().loom).toBeLessThan(peakEarly * 0.5);
  });

  it("recruits the moonwalker retreat under a moderate loom", () => {
    const sim = new Lif(circuit, 7);

    sim.step(2500);

    const mdnBefore = sim.getRates().mdn;
    let mdnPeak = 0;

    sim.inputs.loomL = 0.35;
    sim.inputs.loomR = 0.35;
    Array.from({ length: 1200 }).forEach(() => {
      sim.step(1);
      mdnPeak = Math.max(mdnPeak, sim.getRates().mdn);
      sim.consumeGf();
    });
    // LC16 -> MDN: an approaching object makes the fly back away.
    expect(mdnPeak).toBeGreaterThan(mdnBefore + 1);
  });

  it("responds to direct giant-fibre stimulation", () => {
    const sim = new Lif(circuit, 42);

    sim.step(500);
    sim.consumeGf();
    sim.stimulate(sim.getGroups().gf, 0.5, 40);
    sim.step(60);
    expect(sim.consumeGf()).toBe(true);
  });

  it("slows during the siesta without going comatose", () => {
    const sim = new Lif(circuit, 42);

    sim.step(2000);
    // The compressed midday siesta scale: 1 - (1 - 0.55) * 0.35.
    sim.inputs.activityScale = 1 - (1 - 0.55) * 0.35;

    let walkOn = 0;
    let samples = 0;

    Array.from({ length: 15_000 }).forEach((_, ms) => {
      sim.step(1);
      if (ms % 10 === 0) {
        samples += 1;
        if (sim.getRates().fwd / 10 > 0.22) walkOn += 1;
      }
    });
    expect((100 * walkOn) / samples).toBeGreaterThan(3);
  });

  it("drives the looming population from one eye only", () => {
    const sim = new Lif(circuit, 42);

    sim.step(1500);

    let peak = 0;

    sim.inputs.loomL = 0.3;
    Array.from({ length: 1000 }).forEach(() => {
      sim.step(1);
      peak = Math.max(peak, sim.getRates().loom);
    });
    expect(peak).toBeGreaterThan(3);
  });

  it("consumes the escape latch exactly once via signals", () => {
    const sim = new Lif(circuit, 42);
    const builder = new SignalBuilder();

    sim.step(500);
    sim.consumeGf();
    sim.stimulate(sim.getGroups().gf, 0.5, 40);
    sim.step(60);

    expect(builder.make(sim, DT).escape).toBe(true);
    expect(builder.make(sim, DT).escape).toBe(false);
  });
});

describe("desktopFly body behaviour", () => {
  it("latches onto a window ledge and rides it", () => {
    const fly = new Fly({ x: 0, y: 0 }, 1);

    fly.terrain = [{ id: 1, x0: -400, x1: 400, y: 5 }];

    let latchedFrames = 0;
    let ridingViolations = 0;

    Array.from({ length: 60 * 120 }).forEach(() => {
      fly.update(DT, BOUNDS);
      if (fly.ledge) {
        latchedFrames += 1;
        // Riding: pinned to the ledge line, inside its span.
        if (
          Math.abs(fly.pos.y - 5) >= 25 ||
          fly.pos.x < -400 ||
          fly.pos.x > 400
        ) {
          ridingViolations += 1;
        }
      }
    });
    expect(latchedFrames).toBeGreaterThan(0);
    expect(ridingViolations).toBe(0);
  });

  it("takes off when the ledge underfoot vanishes", () => {
    const fly = new Fly({ x: 0, y: 0 }, 9);

    fly.terrain = [{ id: 1, x0: -400, x1: 400, y: 5 }];
    [fly.ledge] = fly.terrain;
    fly.state = FlyState.Walking;
    fly.speed = 30;
    fly.update(DT, BOUNDS);
    fly.terrain = [];
    fly.update(DT, BOUNDS);

    expect(fly.state).toBe(FlyState.Flying);
    expect(fly.ledge).toBeUndefined();
  });

  it("sleeps on the sleep signal and wakes into grooming", () => {
    const fly = new Fly({ x: 0, y: 0 }, 11);
    const asleep = { ...SLEEP_OFF, sleep: true };

    Array.from({ length: 120 }).forEach(() =>
      fly.update(DT, BOUNDS, undefined, asleep)
    );
    expect(fly.state).toBe(FlyState.Sleeping);

    fly.update(DT, BOUNDS, undefined, SLEEP_OFF);
    expect(fly.state).toBe(FlyState.Grooming);
  });

  it("escapes immediately on a giant-fibre spike", () => {
    const fly = new Fly({ x: 0, y: 0 }, 3);

    fly.update(DT, BOUNDS, { x: 50, y: 0 }, { ...SLEEP_OFF, escape: true });
    expect(fly.state).toBe(FlyState.Flying);
    // Escape flights land on the far side from the threat.
    expect(fly.flightTo.x).toBeLessThan(50);
  });

  it("fears a close cursor without a brain (legacy flies)", () => {
    const fly = new Fly({ x: 0, y: 0 }, 13);

    Array.from({ length: 10 }).forEach(() =>
      fly.update(DT, BOUNDS, { x: 40, y: 0 })
    );
    expect(fly.state).toBe(FlyState.Flying);
  });

  it("stays finite and in bounds over a long free run", () => {
    const fly = new Fly({ x: 100, y: 100 }, 3);
    const states = new Set<number>();

    fly.terrain = [
      { id: 1, x0: -500, x1: 100, y: 200 },
      { id: 0, x0: -960, x1: 960, y: -510 },
    ];
    Array.from({ length: 60 * 60 }).forEach(() => {
      fly.update(DT, BOUNDS);
      states.add(fly.state);
      expect(Number.isFinite(fly.pos.x)).toBe(true);
      expect(Number.isFinite(fly.pos.y)).toBe(true);
      expect(Number.isFinite(fly.heading)).toBe(true);
      expect(Math.abs(fly.pos.x)).toBeLessThanOrEqual(BOUNDS.x / 2 + 60);
      expect(Math.abs(fly.pos.y)).toBeLessThanOrEqual(BOUNDS.y / 2 + 60);
    });
    expect(states.size).toBeGreaterThanOrEqual(2);
  });

  it("animates a tripod gait while walking", () => {
    const fly = new Fly({ x: 0, y: 0 }, 21);

    fly.state = FlyState.Walking;
    fly.speed = 60;

    const startPhase = fly.gaitPhase;

    Array.from({ length: 30 }).forEach(() => {
      fly.stateTimer = 10;
      fly.state = FlyState.Walking;
      fly.speed = 60;
      fly.update(DT, BOUNDS);
    });
    expect(fly.gaitPhase).not.toBe(startPhase);
    // Half the legs swing (lifted) while the other tripod stays planted.
    expect(fly.legs.some(({ lift }) => lift > 0)).toBe(true);
    expect(fly.legs.some(({ lift }) => lift === 0)).toBe(true);
  });
});

const setRect = (
  element: HTMLElement,
  left: number,
  top: number,
  width: number,
  height: number
): void => {
  // eslint-disable-next-line no-param-reassign
  element.getBoundingClientRect = () =>
    ({
      bottom: top + height,
      height,
      left,
      right: left + width,
      top,
      width,
      x: left,
      y: top,
    }) as DOMRect;
};

const addWindow = (
  main: HTMLElement,
  left: number,
  top: number,
  width: number,
  height: number,
  zIndex: number
): HTMLElement => {
  const windowElement = document.createElement("div");

  windowElement.className = "react-draggable";
  windowElement.style.zIndex = String(zIndex);
  setRect(windowElement, left, top, width, height);
  main.append(windowElement);

  return windowElement;
};

const getMain = (): HTMLElement =>
  document.querySelector("main") as HTMLElement;

describe("desktopFly terrain sensing", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.body.append(document.createElement("main"));
  });

  it("always provides the floor above the taskbar", () => {
    const ledges = getLedges(1920, 1080);

    expect(ledges).toEqual([{ id: 0, x0: 0, x1: 1920, y: 1050 }]);
  });

  it("turns a window top into a ledge", () => {
    addWindow(getMain(), 100, 200, 400, 300, 1);

    const ledges = getLedges(1920, 1080);

    expect(ledges).toHaveLength(2);
    expect(ledges[1]).toMatchObject({ x0: 100, x1: 500, y: 200 });
    expect(ledges[1].id).not.toBe(0);
  });

  it("splits a buried ledge around the window in front", () => {
    // Front window (higher z) overlaps the middle of the back window's top.
    addWindow(getMain(), 200, 100, 100, 400, 5);
    addWindow(getMain(), 100, 200, 400, 300, 1);

    const spans = getLedges(1920, 1080)
      .filter(({ y }) => y === 200)
      .map(({ x0, x1 }) => [x0, x1]);

    expect(spans).toContainEqual([100, 200]);
    expect(spans).toContainEqual([300, 500]);
    expect(spans).not.toContainEqual([100, 500]);
  });

  it("ignores minimized windows", () => {
    const windowElement = addWindow(getMain(), 100, 200, 400, 300, 1);

    windowElement.style.pointerEvents = "none";
    expect(getLedges(1920, 1080)).toHaveLength(1);
  });

  it("keeps window identity stable across polls", () => {
    addWindow(getMain(), 100, 200, 400, 300, 1);

    const [, first] = getLedges(1920, 1080);
    const [, second] = getLedges(1920, 1080);

    expect(first.id).toBe(second.id);
  });

  it("converts ledges into the scene frame with y up", () => {
    const scene = ledgesToScene(
      [{ id: 7, x0: 100, x1: 500, y: 200 }],
      1920,
      1080
    );

    expect(scene).toEqual([{ id: 7, x0: -860, x1: -460, y: 340 }]);
  });
});

describe("desktopFly renderer", () => {
  type DrawOp = { coords: number[]; op: string };

  const makeRecordingContext = (): {
    ctx: CanvasRenderingContext2D;
    ops: DrawOp[];
  } => {
    const ops: DrawOp[] = [];
    const record =
      (op: string) =>
      (...coords: number[]): void => {
        ops.push({ coords, op });
      };
    const ctx = {
      beginPath: record("beginPath"),
      ellipse: record("ellipse"),
      fill: record("fill"),
      fillStyle: "",
      lineCap: "round",
      lineTo: record("lineTo"),
      lineWidth: 1,
      moveTo: record("moveTo"),
      stroke: record("stroke"),
      strokeStyle: "",
    } as unknown as CanvasRenderingContext2D;

    return { ctx, ops };
  };

  const frame = { height: 400, width: 400 };

  const measureAbdomenRadius = (scale: number): number => {
    const { ctx, ops } = makeRecordingContext();
    const fly = new Fly({ x: 0, y: 0 }, 7);

    fly.scale = scale;
    drawFly(ctx, fly, frame);

    // Second ellipse is the abdomen; coords are [cx, cy, rx, ry, angle].
    return ops.filter(({ op }) => op === "ellipse")[1].coords[2];
  };

  it("draws a complete fly with finite geometry", () => {
    const { ctx, ops } = makeRecordingContext();

    drawFly(ctx, new Fly({ x: 0, y: 0 }, 7), frame);

    const ellipses = ops.filter(({ op }) => op === "ellipse");
    const lines = ops.filter(({ op }) => op === "lineTo");

    // Shadow, abdomen, bands, wings + veins, thorax, head, eyes.
    expect(ellipses.length).toBeGreaterThanOrEqual(12);
    // Six two-segment legs plus two antennae.
    expect(lines.length).toBe(14);
    ops.forEach(({ coords }) =>
      coords.forEach((value) => expect(Number.isFinite(value)).toBe(true))
    );
  });

  it("draws around the fly's screen position", () => {
    const { ctx, ops } = makeRecordingContext();
    const fly = new Fly({ x: 50, y: 100 }, 7);

    drawFly(ctx, fly, frame);

    // Scene (50, 100) in a 400x400 frame is screen (250, 100).
    const ellipses = ops.filter(({ op }) => op === "ellipse");
    const nearFly = ellipses.filter(
      ({ coords: [x, y] }) => Math.abs(x - 250) < 40 && Math.abs(y - 100) < 40
    );

    expect(nearFly.length).toBe(ellipses.length);
  });

  it("scales up with altitude", () => {
    expect(measureAbdomenRadius(2)).toBeGreaterThan(measureAbdomenRadius(1.15));
  });
});
