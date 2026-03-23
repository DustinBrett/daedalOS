import { useCallback, useEffect, useRef, useState } from "react";
import { TASKBAR_HEIGHT } from "utils/constants";

type Position = {
  x: number;
  y: number;
};

type DragHandleProps = {
  onMouseDown: (event: React.MouseEvent) => void;
  style: { cursor: "grab" | "grabbing" };
};

type UseDraggableWidgetReturn = {
  dragHandleProps: DragHandleProps;
  position: Position;
  style: React.CSSProperties;
};

const resolvePosition = (pos: Position): Position => ({
  x: pos.x < 0 ? window.innerWidth + pos.x : pos.x,
  y: pos.y < 0 ? window.innerHeight + pos.y : pos.y,
});

const useDraggableWidget = (
  defaultPosition: Position
): UseDraggableWidgetReturn => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const draggingRef = useRef(false);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });
  const widgetSizeRef = useRef<{ height: number; width: number }>({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setPosition(resolvePosition(defaultPosition));
    }
  }, [defaultPosition]);

  const onMouseMove = useCallback((event: MouseEvent): void => {
    if (!draggingRef.current) return;

    const maxX = window.innerWidth - widgetSizeRef.current.width;
    const maxY =
      window.innerHeight - TASKBAR_HEIGHT - widgetSizeRef.current.height;

    const nextX = Math.max(
      0,
      Math.min(event.clientX - offsetRef.current.x, maxX)
    );
    const nextY = Math.max(
      0,
      Math.min(event.clientY - offsetRef.current.y, maxY)
    );

    setPosition({ x: nextX, y: nextY });
  }, []);

  const onMouseUp = useCallback((): void => {
    draggingRef.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  const onMouseDown = useCallback(
    (event: React.MouseEvent): void => {
      const target = event.currentTarget as HTMLElement;
      const widget = target.closest("[data-widget]");

      if (widget) {
        const rect = widget.getBoundingClientRect();

        widgetSizeRef.current = {
          height: rect.height,
          width: rect.width,
        };
        offsetRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }

      draggingRef.current = true;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [onMouseMove, onMouseUp]
  );

  useEffect(
    () => (): void => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    },
    [onMouseMove, onMouseUp]
  );

  return {
    dragHandleProps: {
      onMouseDown,
      style: { cursor: draggingRef.current ? "grabbing" : "grab" },
    },
    position,
    style: {
      left: position.x,
      position: "absolute" as const,
      top: position.y,
    },
  };
};

export default useDraggableWidget;
export type { Position };
