export const CASCADE_PADDING = 25;

const TASKBAR_HEIGHT = 30;

type Dimensions = {
  height: number;
  width: number;
};

export const getMaxDimensions = (
  width: number,
  height: number,
  defaultWidth: number,
  defaultHeight: number,
  lockAspectRatio: boolean
): Dimensions => {
  if (width === defaultWidth && height === defaultHeight) {
    let maxWidth = window.innerWidth - CASCADE_PADDING * 2,
      maxHeight = window.innerHeight - CASCADE_PADDING * 2 - TASKBAR_HEIGHT;

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
