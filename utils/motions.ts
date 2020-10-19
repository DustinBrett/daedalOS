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
  const {
    x: launchElementX = 0,
    y: launchElementY = 0
  } = getTargetCenterPosition(launchElement);
  // TODO: Only calc `animation`, not all of them
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
    minmax: {
      scale: 0,
      x: -(window.innerWidth / 2) + taskbarElementX,
      y: -(window.innerHeight / 2) + taskbarElementY
    }
  };
  const initialExitTransform: TransformProperties = {
    scale: 0,
    x: widthOffset + launchElementX,
    y: heightOffset + launchElementY
  };

  return {
    initial: {
      ...initialExitTransform
    },
    exit: {
      ...initialExitTransform
    },
    animate: animationVariants[animation],
    transition: {
      duration: MAXIMIZE_ANIMATION_SPEED_IN_SECONDS
    }
  };
};
