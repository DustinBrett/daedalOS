import WinampIcon from '@/assets/icons/Winamp.png';

import type { FC } from 'react';
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import { useEffect, useRef } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import App, { AppComponent } from '@/contexts/App';

type WebampStoreAction = { type: string; windowId: string };

type WebampStore = {
  store: {
    dispatch: (action: WebampStoreAction) => void;
  };
};

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

const options: Options & PrivateOptions = {
  __initialWindowLayout: {
    main: { position: { x: 0, y: 0 } },
    playlist: { position: { x: 0, y: 116 } }
  },
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

const closeEqualizer = {
  type: 'CLOSE_WINDOW',
  windowId: 'equalizer'
};

// TODO: Closing it just makes it unreachable. Need to do destroy perhaps?

const Winamp: FC<AppComponent> = ({ onClose, onMinimize }) => {
  const elementRef = useRef<HTMLElement>(null),
    onTouchEventsOnly: DraggableEventHandler = (e): void => {
      if (e instanceof MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    loadWebAmp = async(): Promise<Webamp & WebampStore> => {
      const { default: Webamp } = await import('webamp'),
        webamp = new Webamp(options) as Webamp & WebampStore;

      webamp.store.dispatch(closeEqualizer);
      await webamp.renderWhenReady(elementRef.current as HTMLElement);
      elementRef.current?.appendChild(document.getElementById('webamp') || new HTMLElement());

      return webamp;
    };

  useEffect(() => {
    let webamp: Webamp & WebampStore;

    loadWebAmp().then((loadedWebamp) => {
      webamp = loadedWebamp;
    });

    return () => {
      webamp.dispose();
    };
  }, [elementRef]);

  return (
    <Draggable // Q: can I use Rnd? (fixes findDOMNode is deprecated in StrictMode. ?)
      handle='#title-bar'
      onDrag={onTouchEventsOnly}
    >
      <article style={{ marginTop: window.innerHeight / 4 / 2 }} ref={elementRef} />
    </Draggable>
  );
};

export default new App(Winamp, WinampIcon, 'winamp', 'Winamp', false);
