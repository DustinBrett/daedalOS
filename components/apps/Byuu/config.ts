import type { Emulator } from "byuu";

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const keyMap: Record<string, string> = {
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  m: "Mode",
  s: "Select",
  Enter: "Start",
  a: "A",
  b: "B",
  c: "C",
  x: "X",
  y: "Y",
  z: "Z",
  l: "L",
  r: "R",
};

export const prettyKey: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
};

export const prettyEmulator: Record<Emulator, string> = {
  Famicom: "NES",
  "Super Famicom": "SNES",
  "Mega Drive": "Sega Genesis",
};

export const saveExtension = ".sav";
