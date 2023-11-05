import type { MotionProps } from "framer-motion";
import { TASKBAR_HEIGHT, TRANSITIONS_IN_SECONDS } from "utils/constants";
import { viewHeight } from "utils/functions";

const useTaskbarItemTransition = (
  maxHeight: number,
  dynamicPadding = true,
  paddingOffset = 0.5
): MotionProps => {
  const height = Math.min(maxHeight, viewHeight() - TASKBAR_HEIGHT);

  return {
    animate: "active",
    exit: {
      height: `${height * 0.75}px`,
      transition: {
        duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM / 10,
        ease: "circIn",
      },
    },
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM,
      ease: "circOut",
    },
    variants: {
      active: {
        height: `${height}px`,
        paddingTop: 0,
      },
      initial: {
        height: `${height * 0.75}px`,
        paddingTop: dynamicPadding ? `${height * paddingOffset}px` : 0,
      },
    },
  };
};

export default useTaskbarItemTransition;
