import styles from '@/styles/System/Window.module.scss';

import type { FC } from 'react';
import type App from '@/contexts/App';
import type { AppComponent } from '@/contexts/App';

import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { focusOnDrag, focusResizableElementRef } from '@/utils';

export const Window: FC<Partial<App> & AppComponent> = ({
  children,
  icon,
  name,
  onMinimize,
  onClose,
  onFocus,
  onBlur,
  updatePosition,
  updateSize,
  lockAspectRatio,
  hideScrollbars,
  tabIndex,
  zIndex,
  height,
  width,
  x = 0,
  y = 0,
  foreground
}) => {
  const windowRef = useRef<Rnd>(null);

  useEffect(() => focusResizableElementRef(windowRef), [windowRef]);
  useEffect(() => {
    if (foreground) {
      focusResizableElementRef(windowRef);
    }
  }, [foreground]);

  return (
    <article>
      <Rnd
        enableUserSelectHack={false}
        className={styles.window}
        dragHandleClassName="handle"
        cancel=".cancel"
        bounds="main"
        default={{
          height: height || 250,
          width: width || 300,
          x,
          y
        }}
        minHeight={200}
        minWidth={300}
        tabIndex={tabIndex}
        onFocus={onFocus}
        onBlur={onBlur}
        onDragStart={focusOnDrag}
        onDragStop={updatePosition}
        onResizeStop={updateSize}
        ref={windowRef}
        lockAspectRatio={lockAspectRatio}
        style={{ zIndex }}
      >
        <header className="handle">
          <h1>
            <figure>
              <img alt={name} src={icon} draggable={false} />
              <figcaption>{name}</figcaption>
            </figure>
          </h1>
          <nav className="cancel">
            <button id={styles.close} onClick={onClose}>
              <FontAwesomeIcon size="xs" icon={faTimes} />
            </button>
            <button id={styles.minimize} onClick={onMinimize}>
              <FontAwesomeIcon size="xs" icon={faMinus} />
            </button>
            <button id={styles.maximize}>
              <FontAwesomeIcon size="xs" icon={faPlus} />
            </button>
          </nav>
        </header>
        <article style={{ overflow: hideScrollbars ? 'hidden' : 'auto' }}>
          {children}
        </article>
      </Rnd>
    </article>
  );
};
