import WinampIcon from '@/assets/icons/Winamp.png';

import type { FC } from 'react';
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import type { RndDragCallback } from 'react-rnd';
import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
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

const touchControls = `
  #minimize, #close, #volume, #balance, #equalizer-button, #playlist-button, #position, #eject,
  .actions, .shuffle-repeat, .playlist-middle, .playlist-bottom, #playlist-close-button`;

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
      url: '/mp3/llama-2.91.mp3'
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

// TODO: Focus/foreground on load

const Winamp: FC<AppComponent> = ({
  onClose,
  onMinimize,
  onFocus,
  onBlur,
  zIndex
}) => {
  const elementRef = useRef<HTMLElement>(null),
    onTouchEventsOnly: RndDragCallback = (e): void => {
      if (e instanceof MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    loadWebAmp = async (): Promise<Webamp & WebampStore> => {
      const { default: Webamp } = await import('webamp'),
        webamp = new Webamp(options) as Webamp & WebampStore;

      webamp.store.dispatch(closeEqualizer);
      onClose && webamp.onClose(onClose);
      onMinimize && webamp.onMinimize(onMinimize);
      await webamp.renderWhenReady(elementRef.current as HTMLElement);

      elementRef.current?.appendChild(
        document.getElementById('webamp') || new HTMLElement()
      );

      return webamp;
    };

  useEffect(() => {
    let webamp: Webamp & WebampStore;

    loadWebAmp().then((loadedWebamp) => {
      webamp = loadedWebamp;
    });

    return () => {
      webamp?.dispose(); // Q: Why was this undefined when I clicked the taskbar entry?
    };
  }, [elementRef]);

  return (
    <Rnd
      enableResizing={false}
      dragHandleClassName="draggable"
      cancel={touchControls}
      onDrag={onTouchEventsOnly}
      // TODO: Some issues on mobile with focus
      onFocus={onFocus}
      onBlur={onBlur}
      style={{ zIndex }}
    >
      <article ref={elementRef} />
    </Rnd>
  );
};

export default new App({
  component: Winamp,
  icon: WinampIcon,
  name: 'Winamp',
  windowed: false
});
