import type { MotionProps } from "framer-motion";
import { useTheme } from "styled-components";
import {
  MILLISECONDS_IN_SECOND,
  WINDOW_TRANSITION_DURATION_IN_MILLISECONDS,
} from "utils/constants";

const useTaskbarTransition = (): MotionProps => {
  const {
    sizes: { taskbar },
  } = useTheme();

  return {
    animate: "active",
    exit: "initial",
    initial: "initial",
    transition: {
      duration:
        WINDOW_TRANSITION_DURATION_IN_MILLISECONDS / MILLISECONDS_IN_SECOND,
    },
    variants: {
      active: { width: taskbar.entry.maxWidth },
      initial: { width: 0 },
    },
  };
};

export default useTaskbarTransition;
