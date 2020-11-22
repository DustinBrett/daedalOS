/* eslint import/no-duplicates: off */
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import type {
  PrivateOptions,
  WebampStore
} from '@/types/components/Programs/winamp';

const demoTrack = {
  metaData: {
    artist: 'DJ Mike Llama',
    title: "Llama Whippin' Intro"
  },
  url: '/mp3/demo.mp3'
};

/* eslint no-underscore-dangle: off */
/* eslint @typescript-eslint/naming-convention: off */
const __initialWindowLayout = {
  main: { position: { x: 0, y: 0 } },
  playlist: { position: { x: 0, y: 116 } },
  equalizer: { position: { x: 0, y: 232 } }
};

const availableSkins = [
  {
    url: '/skins/SpyAMP_Pro.wsz',
    name: 'SpyAMP Professional Edition v5'
  }
];

export const touchControls = `
  #minimize, #close, #volume, #balance, #equalizer-button, #playlist-button, #position, #eject,
  .actions, .shuffle-repeat, .playlist-middle, .playlist-bottom, #playlist-close-button, #equalizer-window`;

export const webampOptions: Options & PrivateOptions = {
  __initialWindowLayout,
  availableSkins
};

export const loadTrackOrSkin = (
  webamp: Webamp,
  url: string,
  name: string
): void => {
  if (url.includes('.wsz')) {
    webamp.appendTracks([demoTrack]);
    webamp.setSkinFromUrl(url);
  } else {
    webamp.setTracksToPlay([
      url ? { url, metaData: { artist: '', title: name } } : demoTrack
    ]);
  }
};

export const closeEqualizer = (webamp: Webamp & WebampStore): void =>
  webamp.store.dispatch({
    type: 'CLOSE_WINDOW',
    windowId: 'equalizer'
  });
