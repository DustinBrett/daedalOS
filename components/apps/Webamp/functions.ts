import type { Track, WebampCI } from 'components/apps/Webamp/types';
import { centerPosition } from 'components/system/Window/functions';
import type { IAudioMetadata } from 'music-metadata-browser';
import { parseBuffer } from 'music-metadata-browser';
import type { Position } from 'react-rnd';
import { bufferToBlob } from 'utils/functions';

const BASE_WINDOW_SIZE = {
  height: 116,
  width: 275
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
  const { height, width } = BASE_WINDOW_SIZE;
  const { x, y } =
    position || centerPosition({ height: height * 2, width }, taskbarHeight);

  webamp.store.dispatch({
    type: 'UPDATE_WINDOW_POSITIONS',
    positions: {
      main: { x, y },
      playlist: { x, y: height + y }
    }
  });
};

export const focusWindow = (webamp: WebampCI, window: string): void =>
  webamp.store.dispatch({
    type: 'SET_FOCUSED_WINDOW',
    window
  });

export const unFocus = (webamp: WebampCI): void =>
  webamp.store.dispatch({
    type: 'SET_FOCUSED_WINDOW',
    window: ''
  });

export const parseTrack = (file: Buffer, fileName: string): Promise<Track> =>
  new Promise((resolve) =>
    parseBuffer(file).then(
      ({
        common: { artist = '', title = fileName },
        format: { duration = 0 }
      }: IAudioMetadata) =>
        resolve({
          blob: bufferToBlob(file),
          duration: Math.floor(duration),
          metaData: { artist, title }
        })
    )
  );
