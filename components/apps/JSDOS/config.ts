import {
  type DosOptions,
  type EmulatorFunction,
} from "emulators-ui/dist/types/js-dos";

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

export const pathPrefix = "/Program Files/js-dos/";

export const saveExtension = ".zip.save";

export const zipConfigFiles = {
  ".jsdos/dosbox.conf": "/Program Files/js-dos/dosbox.conf",
  ".jsdos/jsdos.json": "/Program Files/js-dos/jsdos.json",
};

export const CAPTURED_KEYS = new Set([
  "Alt",
  "ContextMenu",
  "F1",
  "F3",
  "F5",
  "F6",
  "F7",
  "F10",
  "F11",
  "F12",
]);
