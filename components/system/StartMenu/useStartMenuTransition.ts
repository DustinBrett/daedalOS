import type { MotionProps } from "framer-motion";
import { useTheme } from "styled-components";
import {
  MILLISECONDS_IN_SECOND,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { pxToNum, viewHeight } from "utils/functions";

const useStartMenuTransition = (): MotionProps => {
  const {
    sizes: { startMenu, taskbar },
  } = useTheme();
  const height = Math.min(
    pxToNum(startMenu.maxHeight),
    viewHeight() - pxToNum(taskbar.height)
  );

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
        height: `${height}px`,
        paddingTop: 0,
      },
      initial: {
        height: `${height * 0.75}px`,
        paddingTop: `${height * 0.5}px`,
      },
    },
  };
};

export default useStartMenuTransition;
