import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useState } from "react";
import type { Position } from "react-rnd";

export type SelectionRect = Partial<Size> & Partial<Position>;

type Selection = {
  isSelecting: boolean;
  selectionRect?: SelectionRect;
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
    clientX,
    clientY,
  }) => {
    const { x: targetX = 0, y: targetY = 0 } =
      containerRef.current?.getBoundingClientRect() || {};

    setSize({
      width: clientX - targetX - (x || 0),
      height: clientY - targetY - (y || 0),
    });
  };
  const onMouseDown: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
    target,
  }) => {
    if (target === containerRef.current) {
      const { x: targetX = 0, y: targetY = 0 } =
        containerRef.current.getBoundingClientRect();

      setSize({} as Size);
      setPosition({
        x: clientX - targetX,
        y: clientY - targetY,
      });
    }
  };
  const hasSize = typeof w === "number" && typeof h === "number";
  const hasPosition = typeof x === "number" && typeof y === "number";
  const resetSelection = () => {
    setSize({} as Size);
    setPosition({} as Position);
  };
  const isSelecting = hasSize && hasPosition;
  const selectionStyling = isSelecting
    ? {
        height: `${Math.abs(Number(h))}px`,
        width: `${Math.abs(Number(w))}px`,
        transform: `translate(
            ${Number(x) + (Number(w) < 0 ? Number(w) : 0)}px,
            ${Number(y) + (Number(h) < 0 ? Number(h) : 0)}px)`,
      }
    : {};

  return {
    isSelecting,
    selectionRect: isSelecting ? { ...position, ...size } : undefined,
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
