import { useCallback, useRef } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

const MAX_MOVES = 5;

const useDoubleClick = (
  handler: React.MouseEventHandler,
  singleClick = false
): {
  onClick: React.MouseEventHandler;
  onDoubleClick: React.MouseEventHandler;
} => {
  const timer = useRef<number | undefined>();
  const moveCount = useRef(0);
  const onClick: React.MouseEventHandler = useCallback(
    (event) => {
      const mouseEvent = event.clientX || event.clientY;
      const doubleClickEvent = event.type === "dblclick";

      if (!mouseEvent && !doubleClickEvent) return;

      const runHandler = (): void => {
        event.stopPropagation();
        handler(event);
      };
      const clearTimer = (): void => {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = undefined;
        }
      };
      const clearWhenPointerMoved = (): void => {
        if (moveCount.current >= MAX_MOVES) {
          clearTimer();
        }

        if (timer.current === undefined) {
          event.target.removeEventListener(
            "pointermove",
            clearWhenPointerMoved
          );
          moveCount.current = 0;
        } else {
          moveCount.current += 1;
        }
      };

      if (
        (singleClick && !doubleClickEvent) ||
        (!mouseEvent && doubleClickEvent)
      ) {
        runHandler();
      } else if (timer.current === undefined) {
        timer.current = window.setTimeout(
          clearTimer,
          TRANSITIONS_IN_MILLISECONDS.DOUBLE_CLICK
        );
        event.target.addEventListener("pointermove", clearWhenPointerMoved, {
          passive: true,
        });
      } else {
        clearTimer();
        runHandler();
      }
    },
    [handler, singleClick]
  );

  return { onClick, onDoubleClick: onClick };
};

export default useDoubleClick;
