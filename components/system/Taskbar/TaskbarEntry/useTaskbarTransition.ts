import type { MotionProps } from "framer-motion";
import { useTheme } from "styled-components";
import {
  MILLISECONDS_IN_SECOND,
  TRANSITIONS_IN_MILLISECONDS,
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
      duration: TRANSITIONS_IN_MILLISECONDS.WINDOW / MILLISECONDS_IN_SECOND,
    },
    variants: {
      active: { width: taskbar.entry.maxWidth },
      initial: { width: 0 },
    },
  };
};

export default useTaskbarTransition;
