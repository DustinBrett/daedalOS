type BaseLoadOptions = {
  allowScriptAccess?: boolean;
  autoplay?: "auto" | "off" | "on";
  backgroundColor?: string | null;
  letterbox?: "fullscreen" | "off" | "on";
  unmuteOverlay?: "hidden";
};

type Config = {
  polyfills?: boolean;
  preloader?: boolean;
};

type DataLoadOptions = {
  data: Iterable<number>;
};

export type RufflePlayer = HTMLElement & {
  load: (options: BaseLoadOptions & DataLoadOptions) => Promise<void>;
};

type SourceAPI = {
  createPlayer: () => RufflePlayer;
};

type PublicAPI = {
  config: BaseLoadOptions & Config;
  newest: () => SourceAPI;
};

declare global {
  interface Window {
    RufflePlayer?: PublicAPI;
  }
}
