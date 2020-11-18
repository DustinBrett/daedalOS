import styles from '@/styles/System/WindowManager/Window.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import TitleBar from '@/components/System/WindowManager/TitleBar';
import { focusOnDrag, focusResizableElementRef } from '@/utils/elements';
import { resizeHandleClasses } from '@/utils/window';
import { Rnd } from 'react-rnd';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext, useEffect, useRef } from 'react';

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
  onDrag,
  onResize,
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
      size={{
        height: maximized ? '100%' : height,
        width: maximized ? '100%' : width
      }}
      minHeight={250}
      minWidth={250}
      tabIndex={-1}
      onFocus={onFocus}
      onBlur={onBlur}
      onDragStart={focusOnDrag}
      onDragStop={onDrag}
      onResizeStop={onResize}
      enableResizing={!maximized}
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
      <article className={styles.content} style={{ backgroundColor: bgColor }}>
        {children}
      </article>
    </Rnd>
  );
};

export default Window;
