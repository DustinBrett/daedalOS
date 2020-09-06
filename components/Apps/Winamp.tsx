import type { FC } from 'react';
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import type { RndDragCallback } from 'react-rnd';

import { useContext, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { AppComponent } from '@/contexts/App';
import { appendElement, focusOnDrag } from '@/utils/utils';
import App from '@/contexts/App';
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

const options: Options & PrivateOptions = {
  __initialWindowLayout: {
    main: { position: { x: 0, y: 0 } },
    playlist: { position: { x: 0, y: 116 } },
    equalizer: { position: { x: 0, y: 232 } }
  },
  initialTracks: [
    {
      metaData: {
        artist: 'DJ Mike Llama',
        title: "Llama Whippin' Intro"
      },
      url: '/mp3/demo.mp3'
    }
  ],
  initialSkin: {
    url: '/skins/SpyAMP_Professional_Edition_v5.wsz'
  }
};

const closeEqualizer = {
  type: 'CLOSE_WINDOW',
  windowId: 'equalizer'
};

const Winamp: FC<Partial<App> & AppComponent> = ({
  onClose,
  onMinimize,
  onFocus,
  tabIndex,
  zIndex,
  x = 0,
  y = 0
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
      style={{ zIndex }}
      tabIndex={tabIndex}
    >
      <article ref={elementRef} />
    </Rnd>
  );
};

// export default new App({
//   component: Winamp,
//   icon: WinampIcon,
//   name: 'Winamp',
//   windowed: false
// });
