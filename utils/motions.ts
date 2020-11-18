import type {
  AnimationProps,
  TransformProperties
} from 'framer-motion/types/motion/types';
import type { MotionProps, TargetAndTransition } from 'framer-motion';
import type { WindowMotionSettings } from '@/types/utils/motion';

import {
  foregroundZindex,
  MAXIMIZE_ANIMATION_SPEED_IN_SECONDS,
  TASKBAR_HEIGHT
} from '@/utils/constants';
import {
  getTargetCenterPosition,
  getTargetCenterImagePosition
} from '@/utils/elements';

export const desktopIconDragSettings = {
  dragElastic: 0.25,
  dragTransition: { bounceStiffness: 500, bounceDamping: 15 },
  dragMomentum: false
};

export const desktopIconMotionSettings: MotionProps = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  transition: { y: { type: 'spring' } }
};

export const startMenuEntriesMotionSettings: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

export const taskbarEntriesMotionSettings: MotionProps = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { x: { type: 'spring' } },
  exit: {
    opacity: 0,
    width: 0,
    transition: { duration: 0.3 },
    x: -100
  }
};

export const windowMotionSettings = ({
  initialX = 0,
  initialY = 0,
  animation = 'start',
  height,
  width,
  x,
  y,
  taskbarElement,
  launchElement,
  zIndex
}: WindowMotionSettings): MotionProps => {
  const exitZIndex = foregroundZindex + 1;
  const widthOffset = -Math.floor(width / 2);
  const heightOffset = -Math.floor(height / 2);
  const { x: taskbarElementX, y: taskbarElementY } = getTargetCenterPosition(
    taskbarElement
  );
  let { x: launchElementX, y: launchElementY } = getTargetCenterImagePosition(
    launchElement
  );
  if (launchElementX === 0) {
    launchElementX = window.innerWidth / 2;
  }
  if (launchElementY === 0) {
    launchElementY = window.innerHeight / 2;
  }
  const baseTransform: TransformProperties = {
    scale: 0,
    x: widthOffset + launchElementX,
    y: heightOffset + launchElementY
  };
  const maximizedExitTransform: TransformProperties = {
    scale: 0,
    x: -(window.innerWidth / 2) + launchElementX,
    y: -(window.innerHeight / 2) + launchElementY
  };
  const animationVariants: {
    [key: string]: AnimationProps & TargetAndTransition;
  } = {
    start: {
      scale: 1,
      x: initialX,
      y: initialY,
      height,
      width,
      zIndex
    },
    maximized: {
      scale: 1,
      x: initialX === x ? 0 : -x,
      y: initialY === y ? 0 : -y,
      height: window.innerHeight - TASKBAR_HEIGHT,
      width: '100vw',
      zIndex
    },
    minimized: {
      scale: 0,
      x: widthOffset + taskbarElementX,
      y: heightOffset + taskbarElementY,
      zIndex: exitZIndex
    },
    maxmin: {
      scale: 0,
      x: -(window.innerWidth / 2) + taskbarElementX,
      y: -(window.innerHeight / 2) + taskbarElementY,
      zIndex: exitZIndex
    }
  };

  return {
    initial: baseTransform,
    exit: {
      ...(animation === 'maximized' ? maximizedExitTransform : baseTransform),
      zIndex: exitZIndex
    },
    animate: animationVariants[animation],
    transition: {
      duration: MAXIMIZE_ANIMATION_SPEED_IN_SECONDS
    }
  };
};
