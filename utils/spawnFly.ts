// A connectome-driven fruit fly desktop pet: a leaky integrate-and-fire
// simulation of 668 real FlyWire neurons (~19k synapses) walks a fly along
// window edges, darts from the cursor, grooms, and sleeps at night.
// Adapted from DesktopFly (Denis Shiryaev, MIT) and its gnat port (MIT).
// Data: FlyWire connectome (FAFB v783) — see DATA_LICENSE.md.

import { type FlyApp } from "utils/desktopFly/app";

const CIRCUIT_PATH = "/Program Files/DesktopFly/circuit.json";

let appInstance: FlyApp | undefined;
let appPromise: Promise<FlyApp | undefined> | undefined;

const getApp = async (): Promise<FlyApp | undefined> => {
  if (appInstance) return appInstance;

  appPromise ??= (async () => {
    const [{ FlyApp: FlyAppClass }, { loadCircuit }] = await Promise.all([
      import("utils/desktopFly/app"),
      import("utils/desktopFly/circuit"),
    ]);
    const container = document.querySelector("main");

    // eslint-disable-next-line unicorn/no-useless-undefined
    if (!(container instanceof HTMLElement)) return undefined;

    appInstance = new FlyAppClass(await loadCircuit(CIRCUIT_PATH), container);

    return appInstance;
  })();

  try {
    return await appPromise;
  } catch (error) {
    appPromise = undefined;
    throw error;
  }
};

export const spawnFly = async (): Promise<void> => {
  (await getApp())?.addFly();
};

export const killFly = (): void => {
  appInstance?.removeFly();
  if (appInstance?.count === 0) {
    appInstance = undefined;
    appPromise = undefined;
  }
};

export const countFlies = (): number => appInstance?.count ?? 0;

export const scareFlies = (): void => appInstance?.scare();
