import { adjustHue } from 'polished';
import { MILLISECONDS_IN_SECOND } from 'utils/constants';

const fps = 15;
const timePerFrame = MILLISECONDS_IN_SECOND / fps;

type ColorCycle = {
  onDestroy: () => void;
};

const colorCycle = (
  initialColor: number,
  callback: (newColor: number) => void
): ColorCycle => {
  let lastFrameTime = Date.now();
  let degree = 0;
  let animationFrameId: number;

  const updateColor = () => {
    const currentFrameTime = Date.now();
    const timeSinceLastFrame = currentFrameTime - lastFrameTime;

    if (timeSinceLastFrame > timePerFrame) {
      degree = degree > 360 ? 0 : degree + 1;
      lastFrameTime = currentFrameTime - (timeSinceLastFrame % timePerFrame);

      callback(
        Number(
          adjustHue(degree, `#${initialColor.toString(16)}`).replace('#', '0x')
        )
      );
    }

    animationFrameId = requestAnimationFrame(updateColor);
  };

  animationFrameId = requestAnimationFrame(updateColor);

  const onDestroy = () => cancelAnimationFrame(animationFrameId);

  return { onDestroy };
};

export default colorCycle;
