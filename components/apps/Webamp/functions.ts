import type { WebampCI } from 'components/apps/Webamp/types';
import { centerPosition } from 'components/system/Window/functions';
import type { Position } from 'react-rnd';

const MAIN_HEIGHT = 116;

const updateWindowPositions = (webamp: WebampCI, x = 0, y = 0): void => {
  webamp.store.dispatch({
    type: 'UPDATE_WINDOW_POSITIONS',
    positions: {
      main: { x, y },
      playlist: { x, y: MAIN_HEIGHT + y }
    }
  });
};

export const closeEqualizer = (webamp: WebampCI): void =>
  webamp.store.dispatch({
    type: 'CLOSE_WINDOW',
    windowId: 'equalizer'
  });

export const getWebampElement = (): HTMLDivElement =>
  document.getElementById('webamp') as HTMLDivElement;

export const updateWebampPosition = (
  webamp: WebampCI,
  taskbarHeight: string,
  position?: Position
): void => {
  if (!position) {
    const webampSize = [
      ...getWebampElement().getElementsByClassName('window')
    ].reduce(
      (acc, element) => {
        const { height, width } = element.getBoundingClientRect();

        return {
          height: acc.height + height,
          width
        };
      },
      { height: 0, width: 0 }
    );
    const { x: centerX, y: centerY } = centerPosition(
      webampSize,
      taskbarHeight
    );

    updateWindowPositions(webamp, centerX, centerY);
  } else {
    const { x: previousX = -1, y: previousY = -1 } = position || {};

    updateWindowPositions(webamp, previousX, previousY);
  }
};
