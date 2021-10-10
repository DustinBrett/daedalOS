import type { MotionProps } from "framer-motion";
import { useTheme } from "styled-components";
import {
  MILLISECONDS_IN_SECOND,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";

const useStartMenuTransition = (): MotionProps => {
  const {
    sizes: { startMenu },
  } = useTheme();

  return {
    animate: "active",
    exit: "initial",
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_MILLISECONDS.START_MENU / MILLISECONDS_IN_SECOND,
      ease: "circOut",
    },
    variants: {
      active: {
        height: startMenu.size,
        paddingTop: 0,
      },
      initial: {
        height: `calc(${startMenu.size} * 0.75)`,
        paddingTop: `calc(${startMenu.size} * 0.5)`,
      },
    },
  };
};

export default useStartMenuTransition;
