import { type MotionProps } from "motion/react";
import { useTheme } from "styled-components";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

const useTaskbarTransition = (): MotionProps => {
  const {
    sizes: { taskbar },
  } = useTheme();

  return {
    animate: "active",
    exit: "initial",
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.WINDOW,
    },
    variants: {
      active: { width: taskbar.entry.maxWidth },
      initial: { width: 0 },
    },
  };
};

export default useTaskbarTransition;
