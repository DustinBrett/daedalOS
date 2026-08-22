import { readFileSync } from "fs";
import { join } from "path";
import { parseCircuit } from "utils/desktopFly/circuit";
import { Fly, FlyState } from "utils/desktopFly/fly";
import { Lif } from "utils/desktopFly/lif";
import {
  type MovingRect,
  addThreat,
  appearanceThreat,
  cursorThreat,
  eyeSplit,
  isContact,
  rectThreat,
  takeoffStartle,
  tapThreat,
  threatLevel,
} from "utils/desktopFly/senses";
import { SignalBuilder } from "utils/desktopFly/signals";

const ORIGIN = { x: 0, y: 0 };
/** Heading 0: the fly faces +x. */
const FACING_X = 0;

const movingRect = (overrides: Partial<MovingRect>): MovingRect => ({
  id: 99,
  vx: 0,
  vy: 0,
  x0: 0,
  x1: 100,
  y0: -50,
  y1: 50,
  ...overrides,
});

describe("desktopFly eye model", () => {
  it("sees a frontal stimulus with both eyes", () => {
    const [lw, rw] = eyeSplit(FACING_X, 1, 0);

    expect(lw).toBeCloseTo(rw, 5);
    expect(lw).toBeGreaterThan(0.4);
  });

  it("weights the eye on the stimulus side", () => {
    // Facing +x, stimulus at +y is on the fly's left.
    const [lw, rw] = eyeSplit(FACING_X, 0, 1);

    expect(lw).toBeGreaterThan(rw);
  });

  it("is nearly blind in the rear cone", () => {
    // The two eyes cover ~270° combined; directly behind is the blind zone.
    const [lw, rw] = eyeSplit(FACING_X, -1, 0);

    expect(lw).toBeLessThan(0.05);
    expect(rw).toBeLessThan(0.05);
  });

  it("still sees far-lateral stimuli", () => {
    const [lw] = eyeSplit(FACING_X, 0, 1);
    const [, rw] = eyeSplit(FACING_X, 0, -1);

    expect(lw).toBeGreaterThan(0.5);
    expect(rw).toBeGreaterThan(0.5);
  });
});

describe("desktopFly cursor threat", () => {
  it("looms hard when the cursor lunges in", () => {
    const threat = cursorThreat(
      ORIGIN,
      FACING_X,
      { x: 150, y: 0 },
      { x: -1800, y: 0 }
    );

    expect(threat.loomL + threat.loomR).toBeGreaterThan(0.5);
    expect(threat.puff).toBeGreaterThan(0);
  });

  it("ignores a distant stationary cursor", () => {
    const threat = cursorThreat(
      ORIGIN,
      FACING_X,
      { x: 600, y: 0 },
      { x: 0, y: 0 }
    );

    expect(threatLevel(threat)).toBe(0);
  });

  it("treats a close hovering cursor as a threat", () => {
    const threat = cursorThreat(
      ORIGIN,
      FACING_X,
      { x: 60, y: 0 },
      { x: 0, y: 0 }
    );

    expect(threat.loomL + threat.loomR).toBeGreaterThan(0.1);
  });

  it("sees much less of a lunge from behind, but still feels its wind", () => {
    const front = cursorThreat(
      ORIGIN,
      FACING_X,
      { x: 150, y: 0 },
      { x: -1800, y: 0 }
    );
    const behind = cursorThreat(
      ORIGIN,
      FACING_X,
      { x: -150, y: 0 },
      { x: 1800, y: 0 }
    );

    // Vision has the rear blind cone…
    expect(behind.loomL + behind.loomR).toBeLessThan(
      (front.loomL + front.loomR) * 0.25
    );
    // …but the antennae feel air from any direction.
    expect(behind.puff).toBeCloseTo(front.puff, 5);
  });
});

describe("desktopFly moving-window threat", () => {
  it("never looms when stationary, no matter how close", () => {
    const threat = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ x0: 20, x1: 400 })
    );

    expect(threatLevel(threat)).toBe(0);
  });

  it("looms when dragged toward the fly", () => {
    const threat = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: -600, x0: 150, x1: 500 })
    );

    expect(threat.loomL + threat.loomR).toBeGreaterThan(0.3);
  });

  it("does not loom when dragged away", () => {
    const threat = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: 600, x0: 150, x1: 500 })
    );

    expect(threatLevel(threat)).toBe(0);
  });

  it("is silent beyond the visual radius", () => {
    const threat = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: -600, x0: 700, x1: 1000 })
    );

    expect(threatLevel(threat)).toBe(0);
  });

  it("looms harder the closer and faster it comes", () => {
    const near = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: -700, x0: 120, x1: 500 })
    );
    const far = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: -700, x0: 380, x1: 700 })
    );
    const slow = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: -100, x0: 120, x1: 500 })
    );

    expect(threatLevel(near)).toBeGreaterThan(threatLevel(far));
    expect(threatLevel(near)).toBeGreaterThan(threatLevel(slow));
  });

  it("is attenuated in the rear blind zone", () => {
    const front = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: -600, x0: 150, x1: 500 })
    );
    const behind = rectThreat(
      ORIGIN,
      FACING_X,
      movingRect({ vx: 600, x0: -500, x1: -150 })
    );

    expect(threatLevel(behind)).toBeLessThan(threatLevel(front) * 0.25);
  });
});

describe("desktopFly tap and startle pulses", () => {
  it("reads a nearby click as a strong swat", () => {
    const swat = tapThreat(ORIGIN, FACING_X, { x: 40, y: 0 });

    expect(threatLevel(swat)).toBeGreaterThan(0.5);
    expect(swat.puff).toBeGreaterThan(0.5);
  });

  it("ignores a distant click", () => {
    expect(threatLevel(tapThreat(ORIGIN, FACING_X, { x: 400, y: 0 }))).toBe(0);
  });

  it("fades with distance", () => {
    const near = tapThreat(ORIGIN, FACING_X, { x: 50, y: 0 });
    const far = tapThreat(ORIGIN, FACING_X, { x: 200, y: 0 });

    expect(threatLevel(near)).toBeGreaterThan(threatLevel(far));
  });

  it("startles at a neighbour's takeoff, modestly and locally", () => {
    const near = takeoffStartle(ORIGIN, FACING_X, { x: 60, y: 0 });
    const far = takeoffStartle(ORIGIN, FACING_X, { x: 400, y: 0 });

    expect(threatLevel(near)).toBeGreaterThan(0.1);
    // Contagion is a nudge, not an escape command on its own.
    expect(near.loomL + near.loomR).toBeLessThan(0.7);
    expect(threatLevel(far)).toBe(0);
  });

  it("startles at an appearing object, fading with distance", () => {
    const near = appearanceThreat(ORIGIN, FACING_X, { x: 80, y: 0 });
    const far = appearanceThreat(ORIGIN, FACING_X, { x: 900, y: 0 });

    expect(threatLevel(near)).toBeGreaterThan(0.2);
    expect(threatLevel(far)).toBe(0);
  });

  it("recognises a click on the fly as physical contact", () => {
    expect(isContact(ORIGIN, { x: 20, y: 10 })).toBe(true);
    expect(isContact(ORIGIN, { x: 60, y: 0 })).toBe(false);
  });

  it("accumulates threats with saturation", () => {
    const total = { loomL: 0.8, loomR: 0.8, puff: 0.8 };

    addThreat(total, { loomL: 0.5, loomR: 0.5, puff: 0.5 });
    expect(total.loomL).toBe(1);
    expect(total.loomR).toBe(1);
    expect(total.puff).toBe(1);
  });
});

describe("desktopFly group scatter", () => {
  const circuit = parseCircuit(
    JSON.parse(
      readFileSync(
        join(process.cwd(), "public/Program Files/DesktopFly/circuit.json"),
        "utf8"
      )
    ) as Parameters<typeof parseCircuit>[0]
  );

  it("a window dragged through a group scatters most of it", () => {
    // Six connectome flies clustered in the window's path, exactly as the
    // coordinator wires them: each sees the window from its own position.
    const DT = 1 / 60;
    const bounds = { x: 1920, y: 1080 };
    const flies = Array.from({ length: 6 }, (_, i) => {
      const fly = new Fly(
        { x: 100 + (i % 3) * 90, y: -60 + Math.floor(i / 3) * 120 },
        i + 1
      );

      fly.state = FlyState.Idle;
      fly.speed = 0;

      return fly;
    });
    const brains = flies.map((_, i) => new Lif(circuit, 100 + i));
    const builders = flies.map(() => new SignalBuilder());
    const reacted = new Set<number>();

    // A 500x400 window sweeping left-to-right through the cluster at 700 px/s.
    let rectX = -700;

    for (let frame = 0; frame < 60 * 4; frame += 1) {
      rectX += 700 * DT;

      const rect = movingRect({ vx: 700, x0: rectX, x1: rectX + 500 });

      flies.forEach((fly, i) => {
        const threat = rectThreat(fly.pos, fly.heading, rect);
        const { inputs } = brains[i];

        inputs.loomL = threat.loomL;
        inputs.loomR = threat.loomR;
        inputs.airPuff = threat.puff;
        inputs.gaitDrive = fly.walkingIntensity();
        inputs.gaitPhase = fly.gaitPhase;
        brains[i].step(17);

        const signals = builders[i].make(brains[i], DT);

        fly.update(DT, bounds, undefined, signals);
        if (fly.state === FlyState.Flying || fly.dartTimer > 0) {
          reacted.add(i);
        }
      });
    }

    expect(reacted.size).toBeGreaterThanOrEqual(4);
  });

  it("a dozen brains step a frame well inside the frame budget", () => {
    const brains = Array.from({ length: 12 }, (_, i) => new Lif(circuit, i));
    const started = Date.now();

    // 60 frames of 17 sim-ms each: one second of wall-clock at 60 fps.
    Array.from({ length: 60 }).forEach(() =>
      brains.forEach((brain) => brain.step(17))
    );

    // ~0.2 ms per brain-frame nominally (~150 ms total); 5 s only catches
    // pathological regressions without flaking under a loaded CI.
    expect(Date.now() - started).toBeLessThan(5000);
  });
});
