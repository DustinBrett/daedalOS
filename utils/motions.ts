export const desktopIconDragSettings = {
  dragElastic: 0.15,
  dragTransition: { bounceStiffness: 500, bounceDamping: 15 },
  dragMomentum: false
};

export const desktopIconMotionSettings = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  transition: {
    y: {
      type: 'spring'
    }
  }
};

export const taskbarEntriesMotionSettings = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: {
    x: {
      type: 'spring'
    }
  },
  exit: { opacity: 0, width: 0, transition: { duration: 0.3 }, x: -100 }
};

// TODO: Types
// TODO: Naming is shit
export const windowMotionSettings = ({
  initialX = 0,
  initialY = 0,
  startX = 0,
  startY = 0,
  animation = 'start',
  startIndex = 0
}) => {
  const taskbarEntryWidth = 160, // TODO: Move this
    inOutAnimation = {
      scale: 0,
      x: Math.floor(-(window.innerWidth / 2) + startX),
      y: startY,
      position: 'relative'
    },
    animationVariants = {
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

  return {
    initial: inOutAnimation,
    exit: inOutAnimation,
    animate: animationVariants[animation],
    transition: {
      duration: 0.2
    }
  };
};
