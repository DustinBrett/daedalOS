import useTitle from "components/system/Window/useTitle";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useCallback, useEffect, useState } from "react";
import type { Position } from "react-rnd";

const ZOOM_STEP = 1.1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 7;

type DragPositions = [start: Position, current: Position];

type DragZoom = {
  dragZoomProps: {
    draggable: boolean;
    onMouseDown: React.MouseEventHandler;
    onMouseMove?: React.MouseEventHandler;
    onMouseOut?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    style: React.CSSProperties;
  };
  isMaxZoom: boolean;
  isMinZoom: boolean;
  resetScale: () => void;
  zoom: (zoomDirection: "in" | "out" | "toggle") => void;
};

const useDragZoom = (
  id: string,
  elementRef: React.RefObject<HTMLElement>,
  containerRef: React.RefObject<HTMLElement>
): DragZoom => {
  const [scale, setScale] = useState(MIN_ZOOM);
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  const { appendFileToTitle } = useTitle(id);
  const [dragging, setDragging] = useState<DragPositions | []>([]);
  const [translate, setTranslate] = useState<Position>();
  const { x: tX = 0, y: tY = 0 } = translate || {};
  const isDragging = dragging.length > 0;
  const isMaxZoom = scale === MAX_ZOOM;
  const isMinZoom = scale === MIN_ZOOM;
  const adjustDragZoom = useCallback(
    (newScale: number): void => {
      setScale(newScale);

      const newIsMinZoom = newScale === MIN_ZOOM;

      if (newIsMinZoom) setTranslate({ x: 0, y: 0 });

      appendFileToTitle(
        newIsMinZoom
          ? basename(url)
          : `${basename(url)} (${Math.floor(newScale * 100)}%)`
      );
    },
    [appendFileToTitle, url]
  );
  const zoom = (zoomDirection: "in" | "out" | "toggle"): void => {
    let adjustedScale: number;

    if (zoomDirection === "toggle") {
      adjustedScale = scale === MIN_ZOOM ? MIN_ZOOM * 2 : MIN_ZOOM;
    } else {
      adjustedScale =
        zoomDirection === "in"
          ? Math.min(scale * ZOOM_STEP, MAX_ZOOM)
          : Math.max(scale * (2 - ZOOM_STEP), MIN_ZOOM);
    }

    adjustDragZoom(adjustedScale);
  };
  const onMouseDown: React.MouseEventHandler = (event) => {
    if (scale > MIN_ZOOM) {
      const { pageX: x, pageY: y } = event;

      setDragging([
        { x, y },
        { x, y },
      ]);
    }
  };
  const onMouseMove: React.MouseEventHandler = (event) => {
    const {
      left = 0,
      right = 0,
      top = 0,
      bottom = 0,
    } = elementRef.current?.getBoundingClientRect() || {};
    const {
      left: containerLeft = 0,
      right: containerRight = 0,
      top: containerTop = 0,
      bottom: containerBottom = 0,
    } = containerRef.current?.getBoundingClientRect() || {};
    const [{ x: startX = 0, y: startY = 0 }, { x: lastX = 0, y: lastY = 0 }] =
      dragging as DragPositions;
    const { pageX: currentX = 0, pageY: currentY = 0 } = event;
    const translateX = currentX - lastX;
    const translateY = currentY - lastY;

    setTranslate({
      x:
        left - containerLeft + translateX < 0 &&
        right - containerRight + translateX > 0
          ? tX + translateX
          : tX,
      y:
        top - containerTop + translateY < 0 &&
        bottom - containerBottom + translateY > 0
          ? tY + translateY
          : tY,
    });
    setDragging([
      { x: startX, y: startY },
      { x: currentX, y: currentY },
    ]);
  };
  const resetDrag = (): void => setDragging([]);

  useEffect(() => {
    if (containerRef.current) {
      new ResizeObserver(() => adjustDragZoom(MIN_ZOOM)).observe(
        containerRef.current
      );
    }
  }, [adjustDragZoom, containerRef]);

  return {
    dragZoomProps: {
      draggable: false,
      onMouseDown,
      ...(isDragging && {
        onMouseMove,
        onMouseOut: resetDrag,
        onMouseUp: resetDrag,
      }),
      style: {
        transform: `translateX(${tX}px) translateY(${tY}px) scale(${scale})`,
      },
    },
    isMaxZoom,
    isMinZoom,
    resetScale: () => setScale(MIN_ZOOM),
    zoom,
  };
};

export default useDragZoom;
