import { useEffect, useEffectEvent, useLayoutEffect, useState } from "react";
import { type Position } from "react-rnd";
import { useTheme } from "styled-components";
import {
  cascadePosition,
  centerPosition,
  isWindowOutsideBounds,
  WINDOW_OFFSCREEN_BUFFER_PX,
} from "components/system/Window/functions";
import useMinMaxRef from "components/system/Window/RndWindow/useMinMaxRef";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { getProcesses, useProcess } from "contexts/process";
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
  const stackOrder = useStackOrder();
  const windowState = useWindowState(id);
  const { position: sessionPosition, size: sessionSize } = windowState;
  const [position, setPosition] = useState<Position>(
    () =>
      (!isWindowOutsideBounds(windowState, getWindowViewport()) &&
        sessionPosition) ||
      cascadePosition(id, getProcesses(), stackOrder, cascadeOffset) ||
      centerPosition(size)
  );
  const blockAutoPositionRef = useMinMaxRef(id);
  const monitorViewportResize = useEffectEvent((): void => {
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
  });

  useEffect(() => {
    const onResize = (): void => monitorViewportResize();

    window.addEventListener("resize", onResize, { passive: true });

    return () => window.removeEventListener("resize", onResize);
  }, []);

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
      // eslint-disable-next-line react/set-state-in-effect -- Positions the window from its measured size once mounted
      setPosition(
        calcInitialPosition(componentWindow, initialRelativePosition, size)
      );
    }
  }, [componentWindow, initialRelativePosition, size]);

  return [position, setPosition];
};

export default useDraggable;
