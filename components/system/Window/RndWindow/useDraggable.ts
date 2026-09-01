import { useTheme } from "styled-components";
import { type Position } from "react-rnd";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import useMinMaxRef from "components/system/Window/RndWindow/useMinMaxRef";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import {
  WINDOW_OFFSCREEN_BUFFER_PX,
  cascadePosition,
  centerPosition,
  isWindowOutsideBounds,
} from "components/system/Window/functions";
import { useProcess, useProcessesRef } from "contexts/process";
import { useStackOrder, useWindowState } from "contexts/session";
import { calcInitialPosition, getWindowViewport } from "utils/functions";

type Draggable = [Position, React.Dispatch<React.SetStateAction<Position>>];

const useDraggable = (id: string, size: Size): Draggable => {
  const {
    sizes: {
      window: { cascadeOffset },
    },
  } = useTheme();
  const { autoSizing, closing, componentWindow, initialRelativePosition } =
    useProcess(id);
  const processesRef = useProcessesRef();
  const stackOrder = useStackOrder();
  const windowState = useWindowState(id);
  const { position: sessionPosition, size: sessionSize } = windowState;
  const isOffscreen = useMemo(
    () => isWindowOutsideBounds(windowState, getWindowViewport()),
    [windowState]
  );
  const [position, setPosition] = useState<Position>(
    () =>
      (!isOffscreen && sessionPosition) ||
      cascadePosition(id, processesRef.current, stackOrder, cascadeOffset) ||
      centerPosition(size)
  );
  const blockAutoPositionRef = useMinMaxRef(id);

  useEffect(() => {
    const monitorViewportResize = (): void => {
      const vwSize = getWindowViewport();

      if (isWindowOutsideBounds({ position, size }, vwSize, true)) {
        setPosition(({ x, y }) => {
          const xOffset = vwSize.x - WINDOW_OFFSCREEN_BUFFER_PX.RIGHT;
          const yOffset = vwSize.y - WINDOW_OFFSCREEN_BUFFER_PX.BOTTOM;

          return {
            x: Math.min(x, xOffset),
            y: Math.min(y, yOffset),
          };
        });
      }
    };

    window.addEventListener("resize", monitorViewportResize, { passive: true });

    return () => window.removeEventListener("resize", monitorViewportResize);
  }, [position, size]);

  useLayoutEffect(() => {
    if (
      autoSizing &&
      !closing &&
      sessionSize &&
      !sessionPosition &&
      !blockAutoPositionRef.current
    ) {
      setPosition(centerPosition(sessionSize));
    }
  }, [autoSizing, blockAutoPositionRef, closing, sessionPosition, sessionSize]);

  useLayoutEffect(() => {
    if (initialRelativePosition && componentWindow && size) {
      setPosition(
        calcInitialPosition(componentWindow, initialRelativePosition, size)
      );
    }
  }, [componentWindow, initialRelativePosition, size]);

  return [position, setPosition];
};

export default useDraggable;
