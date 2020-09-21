import styles from '@/styles/System/WindowManager/Window.module.scss';

import type { FC } from 'react';
import type { ProcessState } from '@/utils/pm.d';
import type { AppComponent } from '@/utils/programs.d';

import { useContext, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { focusOnDrag, focusResizableElementRef } from '@/utils/elements';
import { SessionContext } from '@/contexts/SessionManager';

// TODO: Split `<header>` into component (Does it also have to be dynamic? Even though Window is dynamic.)

export const Window: FC<AppComponent & ProcessState> = ({
  children,
  icon,
  id,
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
  height = 250,
  width = 300,
  minimized,
  maximized
}) => {
  const {
      session: { foregroundId }
    } = useContext(SessionContext),
    windowRef = useRef<Rnd>(null);

  useEffect(() => {
    focusResizableElementRef(windowRef);
  }, []);

  return (
    <Rnd
      ref={windowRef}
      enableUserSelectHack={false}
      className={`${styles.window} ${maximized ? styles.maximized : ''} ${
        foregroundId === id ? styles.foreground : ''
      }`}
      dragHandleClassName="handle"
      resizeHandleClasses={{
        top: styles.resizeTop,
        right: styles.resizeRight,
        bottom: styles.resizeBottom,
        left: styles.resizeLeft,
        topRight: styles.resizeTopRight,
        bottomRight: styles.resizeBottomRight,
        bottomLeft: styles.resizeBottomLeft,
        topLeft: styles.resizeTopLeft
      }}
      cancel=".cancel"
      size={{ height, width }}
      minHeight={200}
      minWidth={300}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onDragStart={focusOnDrag}
      onDragStop={updatePosition}
      onResizeStop={updateSize}
      disableDragging={maximized}
      lockAspectRatio={lockAspectRatio}
      style={{ zIndex, visibility: minimized ? 'hidden' : 'visible' }}
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
  );
};

export default Window;
