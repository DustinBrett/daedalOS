import { type MotionProps } from "motion/react";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

const useAITransition = (width: number, widthOffset = 0.75): MotionProps => ({
  animate: "active",
  exit: {
    transition: {
      duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM / 10,
      ease: "circIn",
    },
    width: `${width * widthOffset}px`,
  },
  initial: "initial",
  transition: {
    duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM,
    ease: "circOut",
  },
  variants: {
    active: {
      width: `${width}px`,
    },
    initial: {
      width: `${width * widthOffset}px`,
    },
  },
});

export default useAITransition;
