import type {
  DosOptions,
  EmulatorFunction,
} from "emulators-ui/dist/types/js-dos";

export const defaultConfig = "/Program Files/js-dos/dosbox.conf";

export const dosOptions: DosOptions = {
  emulatorFunction: "dosWorker" as EmulatorFunction,
};

export const globals = [
  "__core-js_shared__",
  "compiled",
  "core",
  "emulatorsUi",
  "exports",
  "WDOSBOX",
  "worker",
];

export const libs = ["/Program Files/js-dos/js-dos.js"];

export const pathPrefix = "/Program Files/js-dos/";

export const saveExtension = ".save.zip";

export const zipConfigPath = ".jsdos/dosbox.conf";
