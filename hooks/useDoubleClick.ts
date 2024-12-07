import { useCallback, useRef } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

const MAX_MOVES = 12;

const useDoubleClick = (
  handler: React.MouseEventHandler,
  singleClick = false
): { onClick: React.MouseEventHandler } => {
  const timer = useRef(0);
  const moveCount = useRef(0);
  const onClick: React.MouseEventHandler = useCallback(
    (event) => {
      const runHandler = (): void => {
        event.stopPropagation();
        handler(event);
      };
      const clearTimer = (): void => {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = 0;
        }
      };
      const clearWhenPointerMoved = (): void => {
        if (moveCount.current >= MAX_MOVES) {
          clearTimer();
        }

        if (timer.current === 0) {
          event.target.removeEventListener(
            "pointermove",
            clearWhenPointerMoved
          );
          moveCount.current = 0;
        } else {
          moveCount.current += 1;
        }
      };

      if (singleClick) {
        runHandler();
      } else if (timer.current === 0) {
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

  return { onClick };
};

export default useDoubleClick;
