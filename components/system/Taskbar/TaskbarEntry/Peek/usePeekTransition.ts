import { type MotionProps } from "motion/react";
import { useTheme } from "styled-components";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

const usePeekTransition = (showControls = false): MotionProps => {
  const {
    sizes: { taskbar },
  } = useTheme();
  let peekContainerHeight =
    taskbar.entry.peekImage.height + taskbar.entry.peekImage.margin * 2;

  if (showControls) peekContainerHeight += taskbar.entry.peekControlsHeight;

  return {
    animate: "active",
    exit: "initial",
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.WINDOW,
      ease: "easeInOut",
    },
    variants: {
      active: {
        height: peekContainerHeight,
        opacity: 1,
      },
      initial: {
        height: 0,
        opacity: 0,
      },
    },
  };
};

export default usePeekTransition;
