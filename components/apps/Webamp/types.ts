import type { Position } from "react-rnd";
import type Webamp from "webamp";

type CloseWindow = {
  type: "CLOSE_WINDOW";
  windowId: string;
};

type SetFocusedWindow = {
  type: "SET_FOCUSED_WINDOW";
  window: string;
};

type UpdateWindowPositions = {
  positions: {
    main: Position;
    playlist: Position;
  };
  type: "UPDATE_WINDOW_POSITIONS";
};

export type WebampCI = Webamp & {
  store: {
    dispatch: (
      command: CloseWindow | SetFocusedWindow | UpdateWindowPositions
    ) => void;
  };
};

declare global {
  interface Window {
    Webamp: typeof Webamp;
  }
}
