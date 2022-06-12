import type { Position } from "react-rnd";
import type Webamp from "webamp";

export type ButterChurnPreset = {
  getPreset: () => Promise<unknown>;
};

export type ButterChurnPresets = Record<string, ButterChurnPreset>;

export type ButterChurnWebampPreset = {
  name: string;
  preset: ButterChurnPreset;
};

type CloseWindow = {
  type: "CLOSE_WINDOW";
  windowId: string;
};

type EnableMilkdrop = {
  open: boolean;
  type: "ENABLE_MILKDROP";
};

type LoadButterchurn = {
  butterchurn: unknown;
  type: "GOT_BUTTERCHURN";
};

type LoadButterchurnPresets = {
  presets: ButterChurnWebampPreset[];
  type: "GOT_BUTTERCHURN_PRESETS";
};

type PresetRequested = {
  addToHistory: boolean;
  index: number;
  type: "PRESET_REQUESTED";
};

type SelectPresetAtIndex = {
  index: number;
  type: "SELECT_PRESET_AT_INDEX";
};

type SetFocusedWindow = {
  type: "SET_FOCUSED_WINDOW";
  window: string;
};

type UpdateWindowPositions = {
  positions: {
    main: Position;
    milkdrop: Position;
    playlist: Position;
  };
  type: "UPDATE_WINDOW_POSITIONS";
};

export type WebampCI = Webamp & {
  store: {
    dispatch: (
      command:
        | CloseWindow
        | EnableMilkdrop
        | LoadButterchurn
        | LoadButterchurnPresets
        | PresetRequested
        | SelectPresetAtIndex
        | SetFocusedWindow
        | UpdateWindowPositions
    ) => void;
    getState: () => {
      milkdrop?: {
        butterchurn?: unknown;
        presets?: ButterChurnPreset[];
      };
      windows?: {
        genWindows?: {
          milkdrop?: {
            open?: boolean;
          };
        };
      };
    };
    subscribe: (listener: () => void) => () => void;
  };
};

export type WebampApiResponse = {
  data: {
    skins: {
      nodes: {
        download_url?: string;
      }[];
    };
  };
};

declare global {
  interface Window {
    Webamp: typeof Webamp;
  }
}
