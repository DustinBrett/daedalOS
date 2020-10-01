import styles from '@/styles/System/WindowManager/Window.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import { useContext, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { TitleBar } from '@/components/System/WindowManager/TitleBar';
import { focusOnDrag, focusResizableElementRef } from '@/utils/elements';
import { SessionContext } from '@/contexts/SessionManager';
import { resizeHandleClasses } from '@/utils/window';

export const Window: React.FC<AppComponent> = ({
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
  maximized
}) => {
  const {
    session: { foregroundId }
  } = useContext(SessionContext);
  const windowRef = useRef<Rnd>(null);

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
      resizeHandleClasses={resizeHandleClasses(styles)}
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
      style={{ zIndex }}
    >
      <TitleBar
        icon={icon}
        name={name}
        onMaximize={onMaximize}
        onMinimize={onMinimize}
        onClose={onClose}
      />
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
