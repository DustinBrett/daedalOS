import type {
  DosOptions,
  EmulatorFunction,
} from "emulators-ui/dist/types/js-dos";

export const defaultConfig = "/libs/jsdos/dosbox.conf";

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

export const libs = ["/libs/jsdos/js-dos.js"];

export const pathPrefix = "/libs/jsdos/";

export const saveExtension = ".save.zip";

export const zipConfigPath = ".jsdos/dosbox.conf";
