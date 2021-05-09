import type { WebampCI } from 'components/apps/Webamp/types';

export const closeEqualizer = (webamp: WebampCI): void =>
  webamp.store.dispatch({
    type: 'CLOSE_WINDOW',
    windowId: 'equalizer'
  });

export const updateWindowPositions = (webamp: WebampCI, x = 0, y = 0): void => {
  webamp.store.dispatch({
    type: 'UPDATE_WINDOW_POSITIONS',
    positions: {
      main: { x, y },
      playlist: { x, y: 116 + y }
    },
    absolute: true
  });
};
