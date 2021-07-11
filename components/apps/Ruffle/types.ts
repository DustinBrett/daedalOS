type BaseLoadOptions = {
  allowScriptAccess?: boolean;
};

type Config = {
  polyfills?: boolean;
};

type DataLoadOptions = {
  data: Iterable<number>;
};

export type RufflePlayer = HTMLElement & {
  load: (options: DataLoadOptions & BaseLoadOptions) => Promise<void>;
};

type SourceAPI = {
  createPlayer(): RufflePlayer;
};

type PublicAPI = {
  config: Config & BaseLoadOptions;
  newest(): SourceAPI;
};

declare global {
  interface Window {
    RufflePlayer: PublicAPI;
  }
}
