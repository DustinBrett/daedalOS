import styles from '@/styles/System/WindowManager/WindowManager.module.scss';

import type { Process } from '@/utils/process';

import dynamic from 'next/dynamic';
import {
  baseZindex,
  foregroundZindex,
  windowsZindexLevel,
  zindexLevelSize
} from '@/utils/constants';
import {
  getNextVisibleWindow,
  getMaxDimensions
} from '@/utils/windowmanager';
import { motion } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext, useEffect } from 'react';
import { windowMotionSettings } from '@/utils/motions';

const Window = dynamic(import('@/components/System/WindowManager/Window'));

const windowZindex = baseZindex + windowsZindexLevel * zindexLevelSize;

const ProcessWindow: React.FC<Process> = ({
  loader: {
    loader: App,
    loadedAppOptions,
    loaderOptions: { width: defaultWidth, height: defaultHeight }
  },
  bgColor,
  height: initialHeight,
  icon,
  id,
  launchElement,
  lockAspectRatio,
  maximized,
  minimized,
  name,
  taskbarElement,
  width: initialWidth,
  windowed,
  x,
  y
}) => {
  const {
    foreground,
    getState,
    saveState,
    session: { foregroundId, stackOrder }
  } = useContext(SessionContext);
  const {
    processes,
    close,
    maximize,
    minimize,
    position,
    restore,
    size
  } = useContext(ProcessContext);
  const { x: previousX = 0, y: previousY = 0 } = getState({
    id
  });
  const { height, width } = getMaxDimensions(
    initialWidth,
    initialHeight,
    defaultWidth,
    defaultHeight,
    lockAspectRatio
  );
  const windowOptions = {
    // TODO: Allow restoring maximized. Allow min when maxed with restore.
    onMinimize: () => minimize(id),
    onMaximize: () => (maximized ? restore(id, 'maximized') : maximize(id)),
    onClose: () => {
      saveState({
        height,
        id,
        width,
        x,
        y
      });
      close(id);
    },
    onFocus: () => foreground(id),
    onBlur: (event: React.FocusEvent) => {
      if (event.relatedTarget !== taskbarElement) {
        foreground('');
      }
    },
    updatePosition: position(id),
    zIndex: windowZindex + stackOrder.slice().reverse().indexOf(id),
    maximized,
    minimized,
    id,
    height,
    width
  };

  useEffect(() => {
    if (foregroundId === id && minimized) {
      foreground(getNextVisibleWindow(processes, stackOrder.filter((stackId) => stackId !== id)));
    } else if (!stackOrder.includes(id)) {
      foreground(getNextVisibleWindow(processes, stackOrder));
    }
  }, [foregroundId, minimized, processes, stackOrder]);

  return (
    <motion.article
      key={id}
      className={styles.animatedWindows}
      style={{
        zIndex: foregroundId === id ? foregroundZindex : windowOptions.zIndex,
        height,
        width
      }}
      {...windowMotionSettings({
        initialX: previousX,
        initialY: previousY,
        animation:
          (minimized && 'minimized') || (maximized && 'maximized') || 'start',
        height,
        width,
        x,
        y,
        taskbarElement,
        launchElement
      })}
    >
      {windowed ? (
        <Window
          icon={icon}
          name={name}
          bgColor={bgColor}
          lockAspectRatio={lockAspectRatio}
          updateSize={size(id)}
          {...windowOptions}
        >
          <App {...loadedAppOptions} {...windowOptions} />
        </Window>
      ) : (
        <App {...loadedAppOptions} {...windowOptions} />
      )}
    </motion.article>
  );
};

export default ProcessWindow;
