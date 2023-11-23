import { type MotionProps } from "framer-motion";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

const useSearchInputTransition = (): MotionProps => {
  return {
    animate: "active",
    exit: {
      bottom: "-40px",
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
        bottom: "-40px",
        position: "absolute",
      },
    },
  };
};

export default useSearchInputTransition;
