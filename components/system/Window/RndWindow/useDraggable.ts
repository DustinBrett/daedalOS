import {
  cascadePosition,
  centerPosition,
} from "components/system/Window/functions";
import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useState } from "react";
import type { Position } from "react-rnd";
import { useTheme } from "styled-components";
import { isRectOutsideWindow, pxToNum } from "utils/functions";

type Draggable = [Position, React.Dispatch<React.SetStateAction<Position>>];

const useDraggable = (id: string, size: Size): Draggable => {
  const {
    sizes: {
      taskbar: { height: taskbarHeight },
      window: { cascadeOffset },
    },
  } = useTheme();
  const { processes } = useProcesses();
  const { stackOrder, windowStates: { [id]: windowState } = {} } = useSession();
  const { position, size: windowSize } = windowState || {};
  const isOffscreen = isRectOutsideWindow(
    position?.x,
    position?.y,
    pxToNum(windowSize?.height),
    pxToNum(windowSize?.width)
  );
  const [{ x, y }, setPosition] = useState<Position>(
    (!isOffscreen && position) ||
      cascadePosition(id, processes, stackOrder, cascadeOffset) ||
      centerPosition(size, taskbarHeight)
  );

  return [{ x, y }, setPosition];
};

export default useDraggable;
