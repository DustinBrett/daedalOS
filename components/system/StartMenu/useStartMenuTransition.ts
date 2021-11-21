import type { MotionProps } from "framer-motion";
import { useTheme } from "styled-components";
import {
  MILLISECONDS_IN_SECOND,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { pxToNum } from "utils/functions";

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
        height: `${pxToNum(startMenu.size) * 0.75}px`,
        paddingTop: `${pxToNum(startMenu.size) * 0.5}px`,
      },
    },
  };
};

export default useStartMenuTransition;
