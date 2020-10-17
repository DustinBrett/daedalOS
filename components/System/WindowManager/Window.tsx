import styles from '@/styles/System/WindowManager/Window.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import TitleBar from '@/components/System/WindowManager/TitleBar';
import { focusOnDrag, focusResizableElementRef } from '@/utils/elements';
import {
  MAXIMIZE_ANIMATION_SPEED_IN_SECONDS,
  MILLISECONDS_IN_SECOND
} from '@/utils/constants';
import { resizeHandleClasses } from '@/utils/window';
import { Rnd } from 'react-rnd';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext, useEffect, useRef, useState } from 'react';

const Window: React.FC<AppComponent> = ({
  children,
  icon = '',
  id,
  name = '',
  bgColor,
  onMaximize,
  onMinimize,
  onClose,
  onFocus,
  onBlur,
  updatePosition,
  updateSize,
  lockAspectRatio,
  zIndex,
  maximized,
  height = 0,
  width = 0
}) => {
  const {
    session: { foregroundId }
  } = useContext(SessionContext);
  const windowRef = useRef<Rnd>(null);
  const [maximizeWindow, setMaximizeWindow] = useState(false);

  useEffect(() => {
    focusResizableElementRef(windowRef);
  }, []);

  useEffect(() => {
    if (maximized) {
      setMaximizeWindow(true);
    } else if (maximizeWindow) {
      setTimeout(
        () => setMaximizeWindow(false),
        MAXIMIZE_ANIMATION_SPEED_IN_SECONDS * MILLISECONDS_IN_SECOND
      );
    }
  }, [maximized]);

  return (
    <Rnd
      ref={windowRef}
      enableUserSelectHack={false}
      className={`${styles.window} ${maximizeWindow ? styles.maximized : ''} ${
        foregroundId === id ? styles.foreground : ''
      }`}
      dragHandleClassName="handle"
      resizeHandleClasses={resizeHandleClasses(styles)}
      cancel=".cancel"
      size={{
        height: maximizeWindow ? '100%' : height,
        width: maximizeWindow ? '100%' : width
      }}
      minHeight={250}
      minWidth={250}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onDragStart={focusOnDrag}
      onDragStop={updatePosition}
      onResizeStop={updateSize}
      enableResizing={!maximizeWindow}
      disableDragging={maximizeWindow}
      lockAspectRatio={lockAspectRatio}
      style={{ zIndex }}
    >
      <TitleBar
        icon={icon}
        name={name}
        onMaximize={onMaximize}
        onMinimize={onMinimize}
        onClose={onClose}
      />
      <article className={styles.content} style={{ backgroundColor: bgColor }}>
        {children}
      </article>
    </Rnd>
  );
};

export default Window;
