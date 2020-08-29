import WinampIcon from '@/assets/icons/Winamp.png';

import type { FC } from 'react';
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import { useEffect, useRef } from 'react';
import App, { AppComponent } from '@/contexts/App';

type PrivateOptions = {
  __initialWindowLayout?: {
    [windowId: string]: {
      position: {
        x: number;
        y: number;
      };
    };
  };
};

type WebampStoreAction = { type: string; windowId: string };

type WebampStore = {
  store: {
    dispatch: (action: WebampStoreAction) => void;
  };
};

const options: Options = {
  initialTracks: [
    {
      metaData: {
        artist: 'DJ Mike Llama',
        title: "Llama Whippin' Intro"
      },
      url: '/mp3/llama-2.91.mp3'
    }
  ],
  initialSkin: {
    url: '/skins/SpyAMP_Professional_Edition_v5.wsz'
  },
  zIndex: 1750
};

// TODO: Closing it just makes it unreachable. Need to do destroy perhaps?
// TODO: Why is it above the taskbar still?

const Winamp: FC<AppComponent> = ({ onClose, onMinimize }) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let webamp: Webamp;

    import('webamp').then((Webamp) => {
      const __initialWindowLayout = {
        main: { position: { x: 0, y: 0 } },
        playlist: { position: { x: 0, y: 116 } }
      };

      webamp = new Webamp.default({
        ...options,
        __initialWindowLayout
      } as Options & PrivateOptions);
      (webamp as Webamp & WebampStore).store.dispatch({
        type: 'CLOSE_WINDOW',
        windowId: 'equalizer'
      });
      webamp.renderWhenReady(elementRef?.current as HTMLElement);
    });

    return () => {
      webamp.dispose();
    };
  }, [elementRef]);

  return (
    <article
      // style={{ marginTop: Math.round(window.innerHeight / 5) }}
      ref={elementRef}
    />
  );
};

export default new App(Winamp, WinampIcon, 'winamp', 'Winamp', false);
