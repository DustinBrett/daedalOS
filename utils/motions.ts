import type {
  AnimationProps,
  TransformProperties
} from 'framer-motion/types/motion/types';
import type { MotionProps, TargetAndTransition } from 'framer-motion';
import type { WindowMotionSettings } from '@/types/utils/motion';

import { taskbarEntryWidth } from '@/utils/constants';

export const desktopIconDragSettings = {
  dragElastic: 0.25,
  dragTransition: { bounceStiffness: 500, bounceDamping: 15 },
  dragMomentum: false
};

export const desktopIconMotionSettings: MotionProps = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  transition: {
    y: {
      type: 'spring'
    }
  }
};

export const taskbarEntriesMotionSettings: MotionProps = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: {
    x: {
      type: 'spring'
    }
  },
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
  startX = 0,
  startY = 0,
  animation = 'start',
  startIndex = 0
}: WindowMotionSettings): MotionProps => {
  const animationVariants: {
    [key: string]: AnimationProps & TargetAndTransition;
  } = {
    start: {
      scale: 1,
      x: initialX,
      y: initialY
    },
    minimized: {
      scale: 0,
      x: taskbarEntryWidth * startIndex - taskbarEntryWidth / 2,
      y: window.innerHeight,
      position: 'fixed'
    }
  };
  const initialExitTransform: TransformProperties = {
    scale: 0,
    x: Math.floor(-(window.innerWidth / 2) + startX),
    y: startY
  };

  return {
    initial: {
      ...initialExitTransform,
      position: 'relative'
    },
    exit: {
      ...initialExitTransform,
      position: 'relative'
    },
    animate: animationVariants[animation],
    transition: {
      duration: 0.2
    }
  };
};
