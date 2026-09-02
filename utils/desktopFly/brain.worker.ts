// Every fly's 9,907-neuron LIF simulation, off the main thread. The app
// sends per-fly sensory inputs each frame and consumes the previous reply's
// body commands — one frame of brain latency, by design. Messages are
// processed strictly in order (a promise chain covers the async circuit
// fetch), so add/remove/frame indices always match the app's fly list.

import { decodeCircuit } from "utils/desktopFly/circuit";
import {
  CompiledCircuit,
  type Inputs,
  Lif,
  patternFor,
} from "utils/desktopFly/lif";
import { SignalBuilder, type Signals } from "utils/desktopFly/signals";

/** The sims can fall at most this far behind before frames are dropped. */
const MAX_STEPS_PER_FRAME = 50;

/**
 * One stimulation request: a named population, or an object's private
 * projection-neuron code, which the worker derives itself from the object
 * key and the fly's salt so the PN index list never crosses a thread.
 */
export type BrainStim = {
  durationMs: number;
  group?: "gf" | "pam" | "ppl1" | "sens";
  index: number;
  key?: string;
  salt?: number;
  strength: number;
};

type BrainRequest =
  | {
      dt: number;
      inputs: Inputs[];
      roster: number;
      stims: BrainStim[];
      type: "frame";
    }
  | { index: number; type: "remove" }
  | { seed: number; type: "add" }
  | { type: "init"; url: string }
  | { type: "reset" };

export type BrainResponse =
  | { roster: number; signals: Signals[]; type: "signals" }
  | { type: "ready" };

let compiled: CompiledCircuit | undefined;
const brains: Lif[] = [];
const builders: SignalBuilder[] = [];
let msAccumulator = 0;

const stepFrame = ({
  dt,
  inputs,
  roster,
  stims,
}: Extract<BrainRequest, { type: "frame" }>): void => {
  msAccumulator += dt * 1000;

  const steps = Math.min(Math.floor(msAccumulator), MAX_STEPS_PER_FRAME);

  msAccumulator -= steps;

  stims.forEach(({ durationMs, group, index, key, salt, strength }) => {
    const brain = brains[index];

    if (!brain) return;

    const groups = brain.getGroups();
    const idx = group
      ? groups[group]
      : patternFor(groups.pn, key ?? "", salt ?? 0);

    brain.stimulate(idx, strength, durationMs);
  });

  const signals = brains.map((brain, i) => {
    // eslint-disable-next-line no-param-reassign
    brain.inputs = inputs[i];
    brain.step(steps);

    const made = builders[i].make(brain, dt);
    const compass = brain.compass();

    if (compass.strength > 0.05) made.compass = compass;

    return made;
  });

  globalThis.postMessage({ roster, signals, type: "signals" });
};

let queue: Promise<unknown> = Promise.resolve();

globalThis.addEventListener(
  "message",
  ({ data }: { data: BrainRequest }) => {
    queue = queue
      .then(async () => {
        switch (data.type) {
          case "init": {
            const response = await fetch(data.url);

            compiled = new CompiledCircuit(
              decodeCircuit(await response.arrayBuffer())
            );
            globalThis.postMessage({ type: "ready" });
            break;
          }
          case "add":
            if (compiled) {
              brains.push(new Lif(compiled, data.seed));
              builders.push(new SignalBuilder());
            }
            break;
          case "remove":
            brains.splice(data.index, 1);
            builders.splice(data.index, 1);
            break;
          case "reset":
            brains.length = 0;
            builders.length = 0;
            msAccumulator = 0;
            break;
          case "frame":
            stepFrame(data);
            break;
          default:
            break;
        }
      })
      .catch(() => {
        // A failed circuit fetch degrades to brainless (default-signal)
        // flies; the chain must survive so later messages still process.
      });
  },
  { passive: true }
);
