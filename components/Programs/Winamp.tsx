import styles from '@/styles/Programs/Winamp.module.scss';

import type Webamp from 'webamp';
import type { AppComponent } from '@/types/utils/programs';
import type { WebampStore } from '@/types/components/Programs/winamp';

import { useContext, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { appendElement, focusOnDrag } from '@/utils/elements';
import { ProcessContext } from '@/contexts/ProcessManager';
import { onTouchEventsOnly } from '@/utils/events';
import {
  closeEqualizer,
  touchControls,
  loadTrackOrSkin,
  webampOptions
} from '@/utils/winamp';

export const loaderOptions = {
  windowed: false
};

const Winamp: React.FC<AppComponent> = ({
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  minimized,
  file: { url = '', name = '' } = {}
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const { position } = useContext(ProcessContext);
  const getWebamp = () => document.getElementById('webamp') as HTMLElement;
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

    loadWebamp().then((loadedWebamp) => {
      webamp = loadedWebamp;
    });

    return () => {
      webamp.dispose();
    };
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
      onDragStop={position('winamp')}
      style={{ zIndex, visibility: minimized ? 'hidden' : 'visible' }}
    >
      <article ref={elementRef} />
    </Rnd>
  );
};

export default Winamp;
