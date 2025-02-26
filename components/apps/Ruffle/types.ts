type BaseLoadOptions = {
  allowScriptAccess?: boolean;
  autoplay?: "auto" | "off" | "on";
  backgroundColor?: string | null;
  letterbox?: "fullscreen" | "off" | "on";
  menu?: boolean;
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
  isPlaying: boolean;
  load: (options: BaseLoadOptions & DataLoadOptions) => Promise<void>;
  pause: () => void;
  play: () => void;
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
