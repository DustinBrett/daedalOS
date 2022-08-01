import {
  cascadePosition,
  centerPosition,
  isWindowOutsideBounds,
} from "components/system/Window/functions";
import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useLayoutEffect, useMemo, useState } from "react";
import type { Position } from "react-rnd";
import { useTheme } from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";
import { calcInitialPosition, viewHeight, viewWidth } from "utils/functions";

type Draggable = [Position, React.Dispatch<React.SetStateAction<Position>>];

const useDraggable = (id: string, size: Size): Draggable => {
  const {
    sizes: {
      window: { cascadeOffset },
    },
  } = useTheme();
  const { processes } = useProcesses();
  const { autoSizing, closing, componentWindow, initialRelativePosition } =
    processes[id] || {};
  const { stackOrder, windowStates: { [id]: windowState } = {} } = useSession();
  const { position: sessionPosition, size: sessionSize } = windowState || {};
  const isOffscreen = useMemo(
    () =>
      isWindowOutsideBounds(windowState, {
        x: viewWidth(),
        y: viewHeight() - TASKBAR_HEIGHT,
      }),
    [windowState]
  );
  const [position, setPosition] = useState<Position>(
    () =>
      (!isOffscreen && sessionPosition) ||
      cascadePosition(id, processes, stackOrder, cascadeOffset) ||
      centerPosition(size)
  );

  useLayoutEffect(() => {
    if (autoSizing && !closing && sessionSize && !sessionPosition) {
      setPosition(centerPosition(sessionSize));
    }
  }, [autoSizing, closing, sessionPosition, sessionSize]);

  useLayoutEffect(() => {
    if (initialRelativePosition && componentWindow) {
      setPosition(
        calcInitialPosition(initialRelativePosition, componentWindow)
      );
    }
  }, [componentWindow, initialRelativePosition]);

  return [position, setPosition];
};

export default useDraggable;
