// A connectome-driven fruit fly desktop pet: a leaky integrate-and-fire
// simulation of 9,907 real FlyWire neurons (~197k aggregated connections:
// the escape core, the EPG/PEN/Delta7 compass ring, every one of the brain's
// 5,177 Kenyon cells behind real PN inputs, and the PFN vector cells) walks
// a fly along window edges, darts from looms, learns, navigates home, sleeps.
// Adapted from DesktopFly (Denis Shiryaev, MIT) and its gnat port (MIT).
// Data: FlyWire connectome (FAFB v783) — see DATA_LICENSE.md.

import { type FlyApp } from "utils/desktopFly/app";

const CIRCUIT_PATH = "/Program Files/DesktopFly/circuit.bin";

let appInstance: FlyApp | undefined;
let appPromise: Promise<FlyApp | undefined> | undefined;
let audioDesired = false;

const getApp = async (): Promise<FlyApp | undefined> => {
  if (appInstance) return appInstance;

  appPromise ??= (async () => {
    const { FlyApp: FlyAppClass } = await import("utils/desktopFly/app");
    const container = document.querySelector("main");

    // eslint-disable-next-line unicorn/no-useless-undefined
    if (!(container instanceof HTMLElement)) return undefined;

    // The circuit is fetched and compiled inside the app's brain worker.
    appInstance = new FlyAppClass(CIRCUIT_PATH, container);

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
  const app = await getApp();

  app?.addFly();
  if (audioDesired) app?.setAudio(true);
};

/** `fly audio on` / `fly audio off`: the audible wing hum, off by default. */
export const setFlyAudio = (enabled: boolean): void => {
  audioDesired = enabled;
  appInstance?.setAudio(enabled);
};

export const killFly = (): void => {
  appInstance?.removeFly();
  if (appInstance?.count === 0) {
    appInstance.destroy();
    appInstance = undefined;
    appPromise = undefined;
  }
};

export const countFlies = (): number => appInstance?.count ?? 0;

export const scareFlies = (): void => appInstance?.scare();
