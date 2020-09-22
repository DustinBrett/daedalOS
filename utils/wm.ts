export const CASCADE_PADDING = 25;

const TASKBAR_HEIGHT = 30;

type Dimensions = {
  height: number;
  width: number;
};

export const getMaxDimensions = (
  width: number,
  height: number,
  lockAspectRatio: boolean
): Dimensions => {
  const maxWidth = window.innerWidth - CASCADE_PADDING * 2,
    maxHeight = window.innerHeight - CASCADE_PADDING * 2 - TASKBAR_HEIGHT;

  if (lockAspectRatio) {
    const aspectLockedHeight = maxWidth * (height / width);

    if (aspectLockedHeight > maxHeight) {
      width = maxHeight / (height / width);
    }
  }

  return {
    height: Math.min(maxHeight, height),
    width: Math.min(maxWidth, width)
  };
};
