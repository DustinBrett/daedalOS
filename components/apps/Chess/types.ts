export type Chessboard2Orientation = "black" | "white";

type Chessboard2DragStartEvent = {
  orientation: Chessboard2Orientation;
  piece: string;
  position: Record<string, string>;
  square: string;
};

type Chessboard2DropEvent = {
  orientation: Chessboard2Orientation;
  piece: string;
  source: string;
  target: string;
  x: number;
  y: number;
};

type SquareSize = "large" | "medium" | "small";

export type GameMode = "cvc" | "hvc" | "hvh";

export type Side = "b" | "w";

export type Chessboard2Config = {
  draggable?: boolean;
  mouseDraggable?: boolean;
  onDragStart?: (event: Chessboard2DragStartEvent) => boolean | void;
  onDrop?: (event: Chessboard2DropEvent) => string | void;
  orientation?: Chessboard2Orientation;
  pieceTheme?: ((piece: string) => string) | string;
  position?: string;
  touchDraggable?: boolean;
};

export type Chessboard2Instance = {
  addCircle: (
    squareOrConfig:
      | {
          color?: string;
          opacity?: number;
          size?: number | SquareSize;
          square: string;
        }
      | string,
    color?: string,
    size?: number | SquareSize
  ) => unknown;
  clear: (animate?: boolean) => void;
  clearCircles: () => void;
  destroy: () => void;
  fen: () => string;
  flip: () => Chessboard2Orientation;
  getOrientation: () => Chessboard2Orientation;
  orientation: (
    side?: "flip" | Chessboard2Orientation
  ) => Chessboard2Orientation;
  position: (fen: string, animate?: boolean) => void;
  resize: () => void;
  start: (animate?: boolean) => void;
};
