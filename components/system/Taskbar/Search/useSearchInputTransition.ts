import { type MotionProps } from "motion/react";
import { useTheme } from "styled-components";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

const useSearchInputTransition = (): MotionProps => {
  const {
    sizes: { search },
  } = useTheme();
  const negativeInputHeight = `-${search.inputHeight}px`;

  return {
    animate: "active",
    exit: {
      bottom: negativeInputHeight,
      position: "absolute",
      transition: {
        duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM / 10,
        ease: "easeIn",
      },
    },
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM / 1,
      ease: "easeOut",
    },
    variants: {
      active: {
        bottom: 0,
        position: "absolute",
      },
      initial: {
        bottom: negativeInputHeight,
        position: "absolute",
      },
    },
  };
};

export default useSearchInputTransition;
