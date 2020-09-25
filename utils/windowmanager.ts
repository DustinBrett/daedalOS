export const CASCADE_PADDING = 25;

const TASKBAR_HEIGHT = 30;

export const getMaxDimensions = (
  width: number,
  height: number,
  defaultWidth = 0,
  defaultHeight = 0,
  lockAspectRatio = false
): { width: number; height: number } => {
  if (width === defaultWidth && height === defaultHeight) {
    let maxWidth = window.innerWidth - CASCADE_PADDING * 2;
    let maxHeight = window.innerHeight - CASCADE_PADDING * 2 - TASKBAR_HEIGHT;

    if (lockAspectRatio) {
      const aspectLockedHeight = Math.min(maxWidth, width) * (height / width);

      if (aspectLockedHeight > maxHeight) {
        maxWidth = maxHeight / (height / width);
      } else {
        maxHeight = aspectLockedHeight;
      }
    }

    return {
      height: Math.min(maxHeight, height),
      width: Math.min(maxWidth, width)
    };
  }

  return { height, width };
};

// TODO: Clean up hardcoded taskbar/titlebar heights
export const getLockedAspectRatioDimensions = (
  width: number,
  height: number
): { width: string | number; height: string | number } => {
  const aspectRatio = width / (height - 24);
  const widerWidth = window.innerWidth / window.innerHeight < aspectRatio;

  return {
    width: widerWidth ? '100%' : (window.innerHeight - 24 - 30) * aspectRatio,
    height: widerWidth ? 'unset' : '100%'
  };
};
