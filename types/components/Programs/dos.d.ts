export type DosCommandInterface = {
  exit: () => void;
};

export type WindowWithDosModules = Window &
  typeof globalThis & {
    __dirname: string;
    Dos: any;
    emulators: any;
  };
