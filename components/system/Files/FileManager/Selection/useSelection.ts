import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useState } from "react";
import type { Position } from "react-rnd";

export type SelectionRect = Partial<Position> & Partial<Size>;

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
    const { scrollTop = 0 } = containerRef.current || {};
    const { x: targetX = 0, y: targetY = 0 } =
      containerRef.current?.getBoundingClientRect() || {};

    setSize({
      height: clientY - targetY - (y || 0) + scrollTop,
      width: clientX - targetX - (x || 0),
    });
  };
  const onMouseDown: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
    target,
  }) => {
    if (target === containerRef.current) {
      const { scrollTop } = containerRef.current;
      const { x: targetX = 0, y: targetY = 0 } =
        containerRef.current.getBoundingClientRect();

      setSize({} as Size);
      setPosition({
        x: clientX - targetX,
        y: clientY - targetY + scrollTop,
      });
    }
  };
  const hasSize = typeof w === "number" && typeof h === "number";
  const hasPosition = typeof x === "number" && typeof y === "number";
  const resetSelection = (): void => {
    setSize({} as Size);
    setPosition({} as Position);
  };
  const isSelecting = hasSize && hasPosition;
  const selectionStyling = isSelecting
    ? {
        height: `${Math.abs(Number(h))}px`,
        transform: `translate(
            ${Number(x) + (Number(w) < 0 ? Number(w) : 0)}px,
            ${Number(y) + (Number(h) < 0 ? Number(h) : 0)}px)`,
        width: `${Math.abs(Number(w))}px`,
      }
    : {};

  return {
    isSelecting,
    selectionEvents: {
      onMouseDown,
      ...(hasPosition
        ? {
            onMouseLeave: resetSelection,
            onMouseMove,
            onMouseUp: resetSelection,
          }
        : {}),
    },
    selectionRect: isSelecting ? { ...position, ...size } : undefined,
    selectionStyling,
  };
};

export default useSelection;
