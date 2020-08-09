import { TASKBAR_HEIGHT, TITLEBAR_HEIGHT } from '@/utils/constants';

export const getLockedAspectRatioDimensions = (
  width: number,
  height: number
): { width: string | number; height: string | number } => {
  const aspectRatio = width / (height - TITLEBAR_HEIGHT);
  const widerWidth = window.innerWidth / window.innerHeight < aspectRatio;

  return {
    width: widerWidth
      ? '100%'
      : (window.innerHeight - TITLEBAR_HEIGHT - TASKBAR_HEIGHT) * aspectRatio,
    height: widerWidth ? 'unset' : '100%'
  };
};
