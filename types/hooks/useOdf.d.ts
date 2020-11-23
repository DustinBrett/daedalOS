export type OdfLib = { load: (url: string) => void };

export type WindowWithWebOdf = Window &
  typeof globalThis & {
    odf: {
      OdfCanvas: new (element: HTMLElement) => OdfLib;
    };
  };
