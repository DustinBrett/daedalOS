import styles from '@/styles/Programs/Winamp.module.scss';

import type Webamp from 'webamp';
import type { AppComponent } from '@/types/utils/programs';
import type { WebampStore } from '@/types/components/Programs/winamp';

import { appendElement, focusOnDrag } from '@/utils/elements';
import {
  closeEqualizer,
  loadTrackOrSkin,
  touchControls,
  webampOptions
} from '@/utils/winamp';
import { onTouchEventsOnly } from '@/utils/events';
import { Rnd } from 'react-rnd';
import { useEffect, useRef, useState } from 'react';

const defaultDimensions = {
  height: 232,
  width: 275
};

const getWebamp = () => document.getElementById('webamp') as HTMLDivElement;

const Winamp: React.FC<AppComponent> = ({
  onBlur,
  onClose,
  onMinimize,
  onFocus,
  updatePosition,
  zIndex,
  minimized,
  file: { url = '', name = '' } = {}
}) => {
  const [closing, setClosing] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const loadWebamp = async (): Promise<Webamp & WebampStore> => {
    const { default: WebampConstructor } = await import('webamp');
    const webamp = new WebampConstructor(webampOptions) as Webamp & WebampStore;
    const { current: containerElement } = elementRef as {
      current: HTMLElement;
    };

    webamp.onWillClose(() => setClosing(true));
    if (onMinimize) webamp.onMinimize(onMinimize);
    closeEqualizer(webamp);
    await webamp.renderWhenReady(containerElement);
    appendElement(containerElement, getWebamp()).focus();
    onFocus();
    loadTrackOrSkin(webamp, url, name);

    return webamp;
  };

  useEffect(() => {
    let webamp: Webamp & WebampStore;
    const tryDispose = () => {
      try {
        webamp.dispose();
      } catch (_exception) {
        /* eslint no-empty: off */
      }
    };

    loadWebamp().then((loadedWebamp) => {
      webamp = loadedWebamp;
    });

    return tryDispose;
  }, []);

  useEffect(() => {
    if (closing) {
      onClose();
      setClosing(false);
    }
  }, [closing, onClose]);

  return (
    <Rnd
      className={styles.winamp}
      cancel={touchControls}
      dragHandleClassName="draggable"
      enableResizing={false}
      enableUserSelectHack={false}
      onBlur={onBlur}
      onDrag={onTouchEventsOnly}
      onDragStart={focusOnDrag}
      onDragStop={updatePosition}
      onFocus={onFocus}
      style={{ zIndex, visibility: minimized ? 'hidden' : 'visible' }}
    >
      <article ref={elementRef} />
    </Rnd>
  );
};

export default Winamp;

export const loaderOptions = {
  windowed: false,
  ...defaultDimensions
};
