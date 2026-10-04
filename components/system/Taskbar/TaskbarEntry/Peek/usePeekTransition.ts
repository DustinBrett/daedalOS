import { type MotionProps } from "motion/react";
import { useTheme } from "styled-components";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

export type PeekPosition = {
  from?: { height: number; x: number };
  x: number;
};

const usePeekTransition = (showControls = false): MotionProps => {
  const {
    sizes: { taskbar },
  } = useTheme();
  let peekContainerHeight =
    taskbar.entry.peekImage.height + taskbar.entry.peekImage.margin * 2;

  if (showControls) peekContainerHeight += taskbar.entry.peekControlsHeight;

  const transition = {
    duration: TRANSITIONS_IN_SECONDS.WINDOW,
    ease: "easeInOut",
  } as const;

  return {
    exit: "initial",
    initial: "initial",
    transition,
    variants: {
      // Slides from the previous peek when moving between taskbar entries
      active: ({ from, x }: PeekPosition) =>
        from
          ? {
              height: [from.height, peekContainerHeight],
              opacity: 1,
              transition: {
                ...transition,
                ease: "easeOut",
                opacity: { duration: 0 },
              },
              x: [from.x, x],
            }
          : {
              height: peekContainerHeight,
              opacity: 1,
              transition: { ...transition, x: { duration: 0 } },
              x,
            },
      initial: {
        height: 0,
        opacity: 0,
      },
    },
  };
};

export default usePeekTransition;
