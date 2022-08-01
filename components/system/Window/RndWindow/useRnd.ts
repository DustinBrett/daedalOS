import rndDefaults from "components/system/Window/RndWindow/rndDefaults";
import useDraggable from "components/system/Window/RndWindow/useDraggable";
import useResizable from "components/system/Window/RndWindow/useResizable";
import { useProcesses } from "contexts/process";
import { useState } from "react";
import type { DraggableEventHandler } from "react-draggable";
import type { Props, RndResizeCallback } from "react-rnd";

const enableIframeCapture = (enable = true): void =>
  document.querySelectorAll("iframe").forEach((iframe) => {
    // eslint-disable-next-line no-param-reassign
    iframe.style.pointerEvents = enable ? "initial" : "none";
  });

const POSITION_WILL_CHANGE = "transform";
const SIZE_WILL_CHANGE = "height, width";

type WillChangeState =
  | typeof POSITION_WILL_CHANGE
  | typeof SIZE_WILL_CHANGE
  | "";

const useRnd = (id: string, maximized = false): Props => {
  const {
    processes: {
      [id]: {
        allowResizing = true,
        autoSizing = false,
        lockAspectRatio = false,
      } = {},
    },
  } = useProcesses();
  const [size, setSize] = useResizable(id, autoSizing);
  const [position, setPosition] = useDraggable(id, size);
  const [willChange, setWillChange] = useState<WillChangeState>();
  const onDragStop: DraggableEventHandler = (
    _event,
    { x: positionX, y: positionY }
  ) => {
    setWillChange("");
    enableIframeCapture();
    setPosition({ x: positionX, y: positionY });
  };
  const onResizeStop: RndResizeCallback = (
    _event,
    _direction,
    { style: { height: elementHeight, width: elementWidth } },
    _delta,
    { x: positionX, y: positionY }
  ) => {
    setWillChange("");
    enableIframeCapture();
    setSize({ height: elementHeight, width: elementWidth });
    setPosition({ x: positionX, y: positionY });
  };

  return {
    disableDragging: maximized,
    enableResizing: allowResizing && !maximized,
    lockAspectRatio,
    onDragStart: () => {
      setWillChange(POSITION_WILL_CHANGE);
      enableIframeCapture(false);
    },
    onDragStop,
    onResizeStart: () => {
      setWillChange(SIZE_WILL_CHANGE);
      enableIframeCapture(false);
    },
    onResizeStop,
    position,
    size,
    style: {
      willChange,
    },
    ...rndDefaults,
  };
};

export default useRnd;
