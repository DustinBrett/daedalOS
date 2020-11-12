import { TASKBAR_HEIGHT, TITLEBAR_HEIGHT } from '@/utils/constants';

export const getLockedAspectRatioDimensions = (
  width: number,
  height: number
): { width: string | number; height: string | number } => {
  const aspectRatio = width / (height - TITLEBAR_HEIGHT);
  const adjustedHeight = window.innerHeight - TASKBAR_HEIGHT - TITLEBAR_HEIGHT;
  const widerWidth = window.innerWidth / adjustedHeight < aspectRatio;

  return {
    width: widerWidth ? '100%' : adjustedHeight * aspectRatio,
    height: widerWidth ? 'auto' : '100%'
  };
};
