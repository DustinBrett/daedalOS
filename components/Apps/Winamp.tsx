import type { FC } from 'react';
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import type { RndDragCallback } from 'react-rnd';
import type { AppComponent } from '@/contexts/App';
import type App from '@/contexts/App';

import { useContext, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { appendElement, focusOnDrag } from '@/utils/elements';
import { AppsContext } from '@/contexts/Apps';

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

const touchControls = `
  #minimize, #close, #volume, #balance, #equalizer-button, #playlist-button, #position, #eject,
  .actions, .shuffle-repeat, .playlist-middle, .playlist-bottom, #playlist-close-button, #equalizer-window`;

const demoTrack = {
  metaData: {
    artist: 'DJ Mike Llama',
    title: "Llama Whippin' Intro"
  },
  url: '/mp3/demo.mp3'
};

const options: Options & PrivateOptions = {
  __initialWindowLayout: {
    main: { position: { x: 0, y: 0 } },
    playlist: { position: { x: 0, y: 116 } },
    equalizer: { position: { x: 0, y: 232 } }
  },
  availableSkins: [
    {
      url: '/skins/SpyAMP_Pro.wsz',
      name: 'SpyAMP Professional Edition v5'
    }
  ]
};

const closeEqualizer = {
  type: 'CLOSE_WINDOW',
  windowId: 'equalizer'
};

export const Winamp: FC<Partial<App> & AppComponent> = ({
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  minimized,
  x = 0,
  y = 0,
  url
}) => {
  const elementRef = useRef<HTMLElement>(null),
    { position } = useContext(AppsContext),
    onTouchEventsOnly: RndDragCallback = (e): void => {
      if (e instanceof MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    loadWebAmp = async (): Promise<Webamp & WebampStore> => {
      const { default: Webamp } = await import('webamp'),
        webamp = new Webamp(options) as Webamp & WebampStore,
        { current: containerElement } = elementRef as { current: HTMLElement };

      webamp?.store?.dispatch(closeEqualizer);
      onClose && webamp?.onClose(onClose);
      onMinimize && webamp?.onMinimize(onMinimize);

      await webamp?.renderWhenReady(containerElement);

      const webampElement = document.getElementById('webamp') as HTMLElement;
      appendElement(containerElement, webampElement);
      webampElement?.focus();
      onFocus?.();

      if (url?.includes('.wsz')) {
        webamp?.appendTracks([demoTrack]);
        webamp?.setSkinFromUrl(url);
      } else {
        webamp?.setTracksToPlay([
          url ? { url: url, metaData: { artist: '', title: '' } } : demoTrack
        ]);
      }

      return webamp;
    };

  useEffect(() => {
    let webamp: Webamp & WebampStore;

    loadWebAmp().then((loadedWebamp) => {
      webamp = loadedWebamp;
    });

    return () => {
      webamp?.dispose();
    };
  }, [elementRef]);

  return (
    <Rnd
      default={{ x: x / 2, y: y / 2, width: 275, height: 232 }}
      enableResizing={false}
      enableUserSelectHack={false}
      dragHandleClassName="draggable"
      cancel={touchControls}
      onDrag={onTouchEventsOnly}
      onFocus={onFocus}
      onDragStart={focusOnDrag}
      onDragStop={position?.('winamp')}
      style={{ zIndex, visibility: minimized ? 'hidden' : 'visible' }}
    >
      <article ref={elementRef} />
    </Rnd>
  );
};

export default Winamp;
