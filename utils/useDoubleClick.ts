import { useRef } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

const useDoubleClick = (
  handler: React.MouseEventHandler,
  singleClick = false
): { onClick: React.MouseEventHandler } => {
  const timer = useRef<NodeJS.Timeout | undefined>();
  const onClick: React.MouseEventHandler = (event) => {
    const runHandler = (): void => {
      event?.stopPropagation();
      handler(event);
    };
    const clearTimer = (): void => {
      if (timer?.current) {
        clearTimeout(timer.current);
        timer.current = undefined;
      }
    };

    if (singleClick) {
      runHandler();
    } else if (typeof timer.current === "undefined") {
      timer.current = setTimeout(
        clearTimer,
        TRANSITIONS_IN_MILLISECONDS.DOUBLE_CLICK
      );
    } else {
      clearTimer();
      runHandler();
    }
  };

  return { onClick };
};

export default useDoubleClick;
