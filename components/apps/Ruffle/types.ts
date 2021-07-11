export type RufflePlayer = HTMLElement & {
  load: (url: string) => Promise<void>;
};

type SourceAPI = {
  createPlayer(): RufflePlayer;
};

type PublicAPI = {
  newest(): SourceAPI;
};

declare global {
  interface Window {
    RufflePlayer: PublicAPI;
  }
}
