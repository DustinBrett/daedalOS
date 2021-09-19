import {
  cascadePosition,
  centerPosition,
  isWindowOutsideBounds,
} from "components/system/Window/functions";
import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useState } from "react";
import type { Position } from "react-rnd";
import { useTheme } from "styled-components";
import { pxToNum, viewHeight, viewWidth } from "utils/functions";

type Draggable = [Position, React.Dispatch<React.SetStateAction<Position>>];

const useDraggable = (id: string, size: Size): Draggable => {
  const {
    sizes: {
      taskbar: { height: taskbarHeight },
      window: { cascadeOffset },
    },
  } = useTheme();
  const { processes } = useProcesses();
  const { autoSizing, closing } = processes[id] || {};
  const { stackOrder, windowStates: { [id]: windowState } = {} } = useSession();
  const { position: sessionPosition, size: sessionSize } = windowState || {};
  const isOffscreen = isWindowOutsideBounds(windowState, {
    x: viewWidth(),
    y: viewHeight() - pxToNum(taskbarHeight),
  });
  const [{ x, y }, setPosition] = useState<Position>(
    (!isOffscreen && sessionPosition) ||
      cascadePosition(id, processes, stackOrder, cascadeOffset) ||
      centerPosition(size, taskbarHeight)
  );

  useEffect(() => {
    if (autoSizing && !closing && sessionSize && !sessionPosition) {
      setPosition(centerPosition(sessionSize, taskbarHeight));
    }
  }, [autoSizing, closing, sessionPosition, sessionSize, taskbarHeight]);

  return [{ x, y }, setPosition];
};

export default useDraggable;
