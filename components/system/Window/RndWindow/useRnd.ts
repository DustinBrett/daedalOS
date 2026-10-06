import { useLayoutEffect, useState } from "react";
import { type DraggableEventHandler } from "react-draggable";
import { type Props, type RndResizeCallback } from "react-rnd";
import { useTheme } from "styled-components";
import {
  coversViewport,
  isWindowOutsideBounds,
} from "components/system/Window/functions";
import rndDefaults, {
  RESIZING_DISABLED,
  RESIZING_ENABLED,
} from "components/system/Window/RndWindow/rndDefaults";
import useDraggable from "components/system/Window/RndWindow/useDraggable";
import useResizable from "components/system/Window/RndWindow/useResizable";
import { useProcess, useProcessesActions } from "contexts/process";
import { useSessionActions, useWindowState } from "contexts/session";
import { getWindowViewport, pxToNum } from "utils/functions";

const enableIframeCapture = (enable = true): void =>
  document.querySelectorAll("iframe").forEach((iframe) => {
    // eslint-disable-next-line no-param-reassign
    iframe.style.pointerEvents = enable ? "initial" : "none";
  });

const disableIframeCapture = (): void => enableIframeCapture(false);

const useRnd = (id: string): Props => {
  const {
    allowResizing = true,
    autoSizing = false,
    hideMaximizeButton = false,
    lockAspectRatio = false,
    maximized = false,
  } = useProcess(id);
  const { maximize } = useProcessesActions();
  const { setWindowStates } = useSessionActions();
  const { maximized: wasMaximized } = useWindowState(id);
  const {
    sizes: { titleBar },
  } = useTheme();
  const [size, setSize] = useResizable(id, autoSizing);
  const [position, setPosition] = useDraggable(id, size);
  // Reopen as it was left, otherwise maximize only when the window would
  // cover the viewport in both dimensions anyway
  // eslint-disable-next-line react/hook-use-state
  const [openMaximized] = useState(
    () =>
      allowResizing &&
      !hideMaximizeButton &&
      (wasMaximized ?? coversViewport(size))
  );
  const onDragStop: DraggableEventHandler = (_event, { x, y }) => {
    enableIframeCapture();

    const newPosition = { x, y };

    if (
      !isWindowOutsideBounds(
        { position: newPosition, size },
        getWindowViewport(),
        true
      )
    ) {
      setPosition(newPosition);
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          ...currentWindowStates[id],
          position: newPosition,
        },
      }));
    }
  };
  const onResizeStop: RndResizeCallback = (
    _event,
    _direction,
    { style: { height, transform, width } },
    _delta,
    resizePosition
  ) => {
    const [, x, y] = /translate\((-?\d+)px, (-?\d+)px\)/.exec(transform) || [];
    const newPosition =
      typeof x === "string" && typeof y === "string"
        ? { x: pxToNum(x), y: pxToNum(y) }
        : resizePosition;

    enableIframeCapture();

    const newSize = { height: pxToNum(height), width: pxToNum(width) };

    if (newPosition.y < 0) {
      if (lockAspectRatio) {
        newSize.width *= 1 + newPosition.y / (newSize.height - titleBar.height);
      }

      newSize.height += newPosition.y;
      newPosition.y = 0;
    }

    if (
      !isWindowOutsideBounds(
        { position: newPosition, size: newSize },
        getWindowViewport(),
        true
      )
    ) {
      setSize(newSize);
      setPosition(newPosition);
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          ...currentWindowStates[id],
          position: newPosition,
          size: newSize,
        },
      }));
    }
  };
  const contentAspectRatio =
    lockAspectRatio &&
    Number(size.width) / (Number(size.height) - titleBar.height);
  const enableResizing =
    allowResizing && !maximized ? RESIZING_ENABLED : RESIZING_DISABLED;

  useLayoutEffect(() => {
    if (openMaximized) maximize(id, true);
  }, [id, maximize, openMaximized]);

  return {
    disableDragging: maximized,
    enableResizing,
    lockAspectRatio: contentAspectRatio,
    lockAspectRatioExtraHeight: lockAspectRatio ? titleBar.height : undefined,
    onDragStart: disableIframeCapture,
    onDragStop,
    onResizeStart: disableIframeCapture,
    onResizeStop,
    position,
    size,
    ...rndDefaults,
  };
};

export default useRnd;
