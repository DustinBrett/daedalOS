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
import { useEffect, useRef } from 'react';

const Winamp: React.FC<AppComponent> = ({
  onClose,
  onMinimize,
  onFocus,
  updatePosition,
  zIndex,
  minimized,
  file: { url = '', name = '' } = {}
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const getWebamp = () => document.getElementById('webamp') as HTMLDivElement;
  const loadWebamp = async (): Promise<Webamp & WebampStore> => {
    const { default: WebampConstructor } = await import('webamp');
    const webamp = new WebampConstructor(webampOptions) as Webamp & WebampStore;
    const { current: containerElement } = elementRef as {
      current: HTMLElement;
    };

    if (onClose) webamp.onClose(onClose);
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
      } catch (exception) {
        /* eslint no-empty: off */
      }
    };

    loadWebamp().then((loadedWebamp) => {
      webamp = loadedWebamp;
    });

    return tryDispose;
  }, []);

  return (
    <Rnd
      className={styles.winamp}
      enableResizing={false}
      enableUserSelectHack={false}
      dragHandleClassName="draggable"
      cancel={touchControls}
      onDrag={onTouchEventsOnly}
      onFocus={onFocus}
      onDragStart={focusOnDrag}
      onDragStop={updatePosition}
      style={{ zIndex, visibility: minimized ? 'hidden' : 'visible' }}
    >
      <article ref={elementRef} />
    </Rnd>
  );
};

export default Winamp;

export const loaderOptions = {
  windowed: false
};
