import type {
  AnimationProps,
  TransformProperties
} from 'framer-motion/types/motion/types';
import type { MotionProps, TargetAndTransition } from 'framer-motion';
import type { WindowMotionSettings } from '@/types/utils/motion';

import { getTargetCenterPosition } from '@/utils/elements';
import {
  MAXIMIZE_ANIMATION_SPEED_IN_SECONDS,
  TASKBAR_HEIGHT
} from '@/utils/constants';

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

// TODO: Refactor this to be more efficent and DRY
export const windowMotionSettings = ({
  initialX = 0,
  initialY = 0,
  animation = 'start',
  height,
  width,
  x,
  y,
  taskbarElement,
  launchElement
}: WindowMotionSettings): MotionProps => {
  const widthOffset = -Math.floor(width / 2);
  const heightOffset = -Math.floor(height / 2);
  const {
    x: taskbarElementX = 0,
    y: taskbarElementY = 0
  } = getTargetCenterPosition(taskbarElement);
  let {
    x: launchElementX = 0,
    y: launchElementY = 0
  } = getTargetCenterPosition(launchElement);
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
      width
    },
    maximized: {
      scale: 1,
      x: initialX === x ? 0 : -x,
      y: initialY === y ? 0 : -y,
      height: window.innerHeight - TASKBAR_HEIGHT,
      width: '100vw'
    },
    minimized: {
      scale: 0,
      x: widthOffset + taskbarElementX,
      y: heightOffset + taskbarElementY
    },
    maxmin: {
      scale: 0,
      x: -(window.innerWidth / 2) + taskbarElementX,
      y: -(window.innerHeight / 2) + taskbarElementY
    }
  };

  return {
    initial: baseTransform,
    exit:
      animation === 'maximized' ? maximizedExitTransform : baseTransform,
    animate: animationVariants[animation],
    transition: {
      duration: MAXIMIZE_ANIMATION_SPEED_IN_SECONDS
    }
  };
};
