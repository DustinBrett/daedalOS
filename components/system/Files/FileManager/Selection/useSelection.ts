import { type Position } from "react-rnd";
import { useRef, useState } from "react";
import { createSelectionStyling } from "components/system/Files/FileManager/Selection/functions";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { useMenu } from "contexts/menu";
import { type MenuState } from "contexts/menu/useMenuContextState";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

export type SelectionRect = Partial<Position> & Partial<Size>;

type Selection = {
  isSelecting: boolean;
  selectionEvents: {
    onMouseDown: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    onMouseMove?: React.MouseEventHandler<HTMLElement>;
    onMouseUp?: () => void;
  };
  selectionRect?: SelectionRect;
  selectionStyling: React.CSSProperties;
};

const useSelection = (
  containerRef: React.RefObject<HTMLElement | null>,
  focusedEntries: string[],
  { blurEntry }: FocusEntryFunctions,
  isDesktop?: boolean
): Selection => {
  const [position, setPosition] = useState<Position>(
    () => Object.create(null) as Position
  );
  const [size, setSize] = useState<Size>(() => Object.create(null) as Size);
  const { x, y } = position;
  const { height: h, width: w } = size;
  const animationRequestId = useRef(0);
  const sizeRef = useRef(size);
  const onMouseMove: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
  }) => {
    if (animationRequestId.current) return;

    const { scrollLeft = 0, scrollTop = 0 } = containerRef.current || {};
    const { x: targetX = 0, y: targetY = 0 } =
      containerRef.current?.getBoundingClientRect() || {};

    setSize({
      height: clientY - targetY - (y || 0) + scrollTop,
      width: clientX - targetX - (x || 0) + scrollLeft,
    });

    animationRequestId.current = window.requestAnimationFrame(() => {
      animationRequestId.current = 0;
    });
  };
  const { menu, setMenu } = useMenu();
  const onMouseDown: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
    target,
  }) => {
    if ((target as HTMLElement) !== containerRef.current) return;

    const { scrollLeft = 0, scrollTop = 0 } = containerRef.current;
    const { x: targetX = 0, y: targetY = 0 } =
      containerRef.current.getBoundingClientRect();

    setSize(Object.create(null) as Size);
    setPosition({
      x: clientX - targetX + scrollLeft,
      y: clientY - targetY + scrollTop,
    });

    if (menu && Object.keys(menu).length > 0) {
      setMenu(Object.create(null) as MenuState);
    }
    if (focusedEntries.length > 0) blurEntry();
  };
  const hasSize = typeof w === "number" && typeof h === "number";
  const hasPosition = typeof x === "number" && typeof y === "number";
  const isSelecting = hasSize && hasPosition && Object.keys(menu).length === 0;
  const selection: Selection = {
    isSelecting,
    selectionEvents: {
      onMouseDown,
    },
    selectionStyling: createSelectionStyling(isSelecting, h, w, x, y),
  };

  if (hasPosition) {
    const resetSelection = (): void => {
      setSize(Object.create(null) as Size);
      setPosition(Object.create(null) as Position);
    };
    const originalScrollHeight = containerRef.current?.scrollHeight || 0;
    const originalScrollWidth = containerRef.current?.scrollWidth || 0;
    const onMouseLeave = (): void => {
      if (selection.isSelecting) {
        const externalMouseMove = (event: MouseEvent): void => {
          onMouseMove(event as unknown as React.MouseEvent<HTMLElement>);

          if (isDesktop || !containerRef.current) return;

          const diffX = Math.abs(Number(sizeRef.current.width)) / 100 + 1;
          const diffY = Math.abs(Number(sizeRef.current.height)) / 100 + 1;

          containerRef.current.scrollBy(
            containerRef.current.scrollLeft + containerRef.current.clientWidth >
              originalScrollWidth
              ? 0
              : Math.round(event.movementX * diffX),
            containerRef.current.scrollTop + containerRef.current.clientHeight >
              originalScrollHeight
              ? 0
              : Math.round(event.movementY * diffY)
          );
        };

        window.addEventListener("mousemove", externalMouseMove);
        window.addEventListener(
          "mouseup",
          () => {
            resetSelection();
            window.removeEventListener("mousemove", externalMouseMove);
          },
          ONE_TIME_PASSIVE_EVENT
        );
      }
    };

    selection.selectionEvents.onMouseLeave = onMouseLeave;
    selection.selectionEvents.onMouseMove = onMouseMove;
    selection.selectionEvents.onMouseUp = resetSelection;
  }

  if (isSelecting) {
    selection.selectionRect = Object.assign(
      Object.create(null) as SelectionRect,
      position,
      size
    );
    sizeRef.current = size;
  }

  return selection;
};

export default useSelection;
