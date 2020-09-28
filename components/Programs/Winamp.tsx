/* eslint import/no-duplicates: off */
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import type { RndDragCallback } from 'react-rnd';
import type { AppComponent } from '@/types/utils/programs';
import type {
  PrivateOptions,
  WebampStore
} from '@/types/components/Programs/winamp';

import { useContext, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { appendElement, focusOnDrag } from '@/utils/elements';
import { ProcessContext } from '@/contexts/ProcessManager';

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

export const loaderOptions = {
  windowed: false
};

export const Winamp: React.FC<AppComponent> = ({
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  minimized,
  x = 0,
  y = 0,
  file: { url = '', name = '' } = {}
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const { position } = useContext(ProcessContext);
  const onTouchEventsOnly: RndDragCallback = (e): void => {
    if (e instanceof MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const loadWebAmp = async (): Promise<Webamp & WebampStore> => {
    const { default: WebampConstructor } = await import('webamp');
    const webamp = new WebampConstructor(options) as Webamp & WebampStore;
    const { current: containerElement } = elementRef as {
      current: HTMLElement;
    };

    if (onClose) webamp.onClose(onClose);
    if (onMinimize) webamp.onMinimize(onMinimize);
    webamp.store.dispatch(closeEqualizer);

    await webamp.renderWhenReady(containerElement);

    appendElement(
      containerElement,
      document.getElementById('webamp') as HTMLElement
    ).focus();
    onFocus();

    if (url.includes('.wsz')) {
      webamp.appendTracks([demoTrack]);
      webamp.setSkinFromUrl(url);
    } else {
      webamp.setTracksToPlay([
        url ? { url, metaData: { artist: '', title: name } } : demoTrack
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
      webamp.dispose();
    };
  }, []);

  return (
    <Rnd
      default={{
        x: x / 2,
        y: y / 2,
        width: 275,
        height: 232
      }}
      enableResizing={false}
      enableUserSelectHack={false}
      dragHandleClassName="draggable"
      cancel={touchControls}
      onDrag={onTouchEventsOnly}
      onFocus={onFocus}
      onDragStart={focusOnDrag}
      onDragStop={position('winamp')}
      style={{ zIndex, visibility: minimized ? 'hidden' : 'visible' }}
    >
      <article ref={elementRef} />
    </Rnd>
  );
};

export default Winamp;
