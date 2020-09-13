import styles from '@/styles/System/Window.module.scss';

import type { FC } from 'react';
import type { Process } from '@/utils/pm';
import type { AppComponent } from '@/utils/apps.d';

import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { focusOnDrag, focusResizableElementRef } from '@/utils/elements';

export const Window: FC<Partial<Process> & AppComponent> = ({
  children,
  icon,
  name,
  bgColor,
  onMaximize,
  onMinimize,
  onClose,
  onFocus,
  onBlur,
  updatePosition,
  updateSize,
  lockAspectRatio,
  hideScrollbars,
  zIndex,
  height,
  width,
  x = 0,
  y = 0,
  foreground,
  minimized,
  maximized
}) => {
  const windowRef = useRef<Rnd>(null);

  useEffect(() => focusResizableElementRef(windowRef), [windowRef]);
  useEffect(() => {
    if (foreground) {
      focusResizableElementRef(windowRef);
    }
  }, [foreground, windowRef]);

  return (
    <article
      style={{
        visibility: minimized ? 'hidden' : 'visible'
      }}
    >
      <Rnd
        enableUserSelectHack={false}
        className={`${styles.window} ${maximized ? styles.maximized : ''}`}
        dragHandleClassName="handle"
        cancel=".cancel"
        default={{
          height: height || 250,
          width: width || 300,
          x,
          y
        }}
        minHeight={200}
        minWidth={300}
        tabIndex={0}
        onFocus={onFocus}
        onBlur={onBlur}
        onDragStart={focusOnDrag}
        onDragStop={updatePosition}
        onResizeStop={updateSize}
        disableDragging={maximized}
        ref={windowRef}
        lockAspectRatio={lockAspectRatio}
        style={{ zIndex }}
      >
        <header className={`${styles.titlebar} handle`}>
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
            <button id={styles.maximize} onClick={onMaximize}>
              <FontAwesomeIcon size="xs" icon={faPlus} />
            </button>
          </nav>
        </header>
        <article
          className={styles.content}
          style={{
            backgroundColor: bgColor,
            overflow: hideScrollbars ? 'hidden' : 'auto'
          }}
        >
          {children}
        </article>
      </Rnd>
    </article>
  );
};

export default Window;
