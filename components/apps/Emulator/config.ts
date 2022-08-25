export type Core = {
  core: string;
  ext: string[];
  zip?: boolean;
};

export const emulatorCores: Record<string, Core> = {
  "Atari 2600": {
    core: "atari2600",
    ext: [".a26"],
  },
  "Atari 5200": {
    core: "atari5200",
    ext: [".a52"],
  },
  "Atari 7800": {
    core: "atari7800",
    ext: [".a78"],
  },
  "Atari Jaguar": {
    core: "jaguar",
    ext: [".j64", ".jag"],
  },
  "Atari Lynx": {
    core: "lynx",
    ext: [".lnx"],
  },
  "Neo Geo Pocket": {
    core: "ngp",
    ext: [".ngc", ".ngp"],
  },
  "Nintendo 64": {
    core: "n64",
    ext: [".n64", ".v64", ".z64"],
  },
  "Nintendo DS": {
    core: "nds",
    ext: [".nds"],
  },
  "Nintendo Entertainment System": {
    core: "nes",
    ext: [".nes"],
  },
  "Nintendo Game Boy": {
    core: "gb",
    ext: [".gb"],
  },
  "Nintendo Game Boy Advance": {
    core: "gba",
    ext: [".gba"],
  },
  "Nintendo Game Boy Color": {
    core: "gb",
    ext: [".gbc"],
  },
  "PC Engine": {
    core: "pce",
    ext: [".pce"],
  },
  "Sega 32X": {
    core: "sega32x",
    ext: [".32x"],
  },
  "Sega Game Gear": {
    core: "segaGG",
    ext: [".gg"],
    zip: true,
  },
  "Sega Genesis / Mega Drive": {
    core: "segaMD",
    ext: [".gen", ".md", ".smd"],
  },
  "Sega Master System": {
    core: "segaMS",
    ext: [".sms"],
    zip: true,
  },
  "Super Nintendo Entertainment System": {
    core: "snes",
    ext: [".sfc", ".smc"],
  },
  "Virtual Boy": {
    core: "vb",
    ext: [".vb", ".vboy"],
  },
  WonderSwam: {
    core: "ws",
    ext: [".ws", ".wsc"],
  },
};
