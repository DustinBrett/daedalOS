import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useState } from "react";
import type { Position } from "react-rnd";

type Selection = {
  isSelecting: boolean;
  selectionStyling: React.CSSProperties;
  selectionEvents: {
    onMouseDown: React.MouseEventHandler<HTMLElement>;
    onMouseMove?: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    onMouseUp?: () => void;
  };
};

const useSelection = (
  containerRef: React.MutableRefObject<HTMLElement | null>
): Selection => {
  const [position, setPosition] = useState<Position>();
  const [size, setSize] = useState<Size>();
  const { x, y } = position || {};
  const { height: h, width: w } = size || {};
  const onMouseMove: React.MouseEventHandler<HTMLElement> = ({
    pageX,
    pageY,
  }) =>
    setSize({
      width: pageX - (x || 0),
      height: pageY - (y || 0),
    });
  const onMouseDown: React.MouseEventHandler<HTMLElement> = ({
    target,
    pageX,
    pageY,
  }) => {
    if (target === containerRef?.current) {
      setSize({} as Size);
      setPosition({ x: pageX, y: pageY });
    }
  };
  const hasSize = typeof w === "number" && typeof h === "number";
  const hasPosition = typeof x === "number" && typeof y === "number";
  const resetSelection = () => {
    setSize({} as Size);
    setPosition({} as Position);
  };
  const selectionStyling =
    hasSize && hasPosition
      ? {
          height: `${Math.abs(Number(h))}px`,
          width: `${Math.abs(Number(w))}px`,
          transform: `translate(
            ${Number(x) + (Number(w) < 0 ? Number(w) : 0)}px,
            ${Number(y) + (Number(h) < 0 ? Number(h) : 0)}px)`,
        }
      : {};

  return {
    isSelecting: hasSize && hasPosition,
    selectionStyling,
    selectionEvents: {
      onMouseDown,
      ...(hasPosition
        ? {
            onMouseMove,
            onMouseLeave: resetSelection,
            onMouseUp: resetSelection,
          }
        : {}),
    },
  };
};

export default useSelection;
