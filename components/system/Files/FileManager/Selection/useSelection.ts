import { type Position } from "react-rnd";
import { useRef, useState } from "react";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { useMenu } from "contexts/menu";
import { type MenuState } from "contexts/menu/useMenuContextState";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

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

const FPS = 60;
const DEBOUNCE_TIME = MILLISECONDS_IN_SECOND / FPS;

const useSelection = (
  containerRef: React.MutableRefObject<HTMLElement | null>,
  focusedEntries: string[],
  { blurEntry }: FocusEntryFunctions
): Selection => {
  const [position, setPosition] = useState<Position>(
    () => Object.create(null) as Position
  );
  const [size, setSize] = useState<Size>(() => Object.create(null) as Size);
  const { x, y } = position;
  const { height: h, width: w } = size;
  const debounceTimer = useRef<number>();
  const onMouseMove: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
  }) => {
    const { scrollTop = 0 } = containerRef.current || {};
    const { x: targetX = 0, y: targetY = 0 } =
      containerRef.current?.getBoundingClientRect() || {};

    if (!debounceTimer.current) {
      setSize({
        height: clientY - targetY - (y || 0) + scrollTop,
        width: clientX - targetX - (x || 0),
      });
      debounceTimer.current = window.setTimeout(() => {
        debounceTimer.current = undefined;
      }, DEBOUNCE_TIME);
    }
  };
  const { menu, setMenu } = useMenu();
  const onMouseDown: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
    target,
  }) => {
    if (target === containerRef.current) {
      const { scrollTop } = containerRef.current;
      const { x: targetX = 0, y: targetY = 0 } =
        containerRef.current.getBoundingClientRect();

      setSize(Object.create(null) as Size);
      setPosition({
        x: clientX - targetX,
        y: clientY - targetY + scrollTop,
      });

      if (menu && Object.keys(menu).length > 0) {
        setMenu(Object.create(null) as MenuState);
      }
      if (focusedEntries.length > 0) blurEntry();
    }
  };
  const hasMenu = Object.keys(menu).length > 0;
  const hasSize = typeof w === "number" && typeof h === "number";
  const hasPosition = typeof x === "number" && typeof y === "number";
  const resetSelection = (): void => {
    setSize(Object.create(null) as Size);
    setPosition(Object.create(null) as Position);
  };
  const isSelecting = !hasMenu && hasSize && hasPosition;
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
