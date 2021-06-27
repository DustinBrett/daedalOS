import type { Track, WebampCI } from 'components/apps/Webamp/types';
import { centerPosition } from 'components/system/Window/functions';
import type { IAudioMetadata } from 'music-metadata-browser';
import { parseBuffer } from 'music-metadata-browser';
import type { Position } from 'react-rnd';
import { bufferToBlob, cleanUpBufferUrl } from 'utils/functions';

export const BASE_WEBAMP_OPTIONS = {
  availableSkins: [
    { url: '/skins/Aqua_X.wsz', name: 'Aqua X' },
    { url: '/skins/Nucleo_NLog_v102.wsz', name: 'Nucleo NLog v2G' },
    {
      url: '/skins/SpyAMP_Professional_Edition_v5.wsz',
      name: 'SpyAMP Professional Edition v5'
    }
  ]
};

const BASE_WINDOW_SIZE = {
  height: 116,
  width: 275
};

export const cleanBufferOnSkinLoad = (
  webamp: WebampCI,
  url = ''
): Promise<void> =>
  webamp.skinIsLoaded().then(() => {
    if (url) cleanUpBufferUrl(url);
  });

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
