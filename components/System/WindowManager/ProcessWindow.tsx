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
  focusNextVisibleWindow,
  getMaxDimensions
} from '@/utils/windowmanager';
import { motion } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { useCallback, useContext } from 'react';
import { windowMotionSettings } from '@/utils/motions';

const Window = dynamic(import('@/components/System/WindowManager/Window'));

const windowZindex = baseZindex + windowsZindexLevel * zindexLevelSize;

// TODO: Stop so many re-renders on stackOrder & foregroundId changes
// TODO: Focus next window without the need for processes and stackOrder

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
    onMinimize: useCallback(() => {
      // TODO: Allow restoring maximized. Fix max restore.
      // if (maximized) restore(id, 'maximized');
      minimize(id);
      focusNextVisibleWindow(stackOrder, processes, foreground);
    }, [id, processes, stackOrder]),
    onMaximize: useCallback(
      () => (maximized ? restore(id, 'maximized') : maximize(id)),
      [id, maximized]
    ),
    onClose: useCallback(() => {
      saveState({
        id,
        height,
        width,
        x,
        y
      });
      close(id);
      focusNextVisibleWindow(stackOrder, processes, foreground);
    }, [height, id, processes, stackOrder, width, x, y]),
    onFocus: useCallback(() => foreground(id), [id]),
    onBlur: useCallback(
      (event: React.FocusEvent) => {
        if (event.relatedTarget !== taskbarElement) {
          foreground('');
        }
      },
      [taskbarElement]
    ),
    updatePosition: useCallback((event, data) => position(id)(event, data), [
      id
    ]),
    zIndex: windowZindex + stackOrder.slice().reverse().indexOf(id),
    maximized,
    minimized,
    id,
    height,
    width
  };
  const updateSize = useCallback(
    (event, dir, ref, delta, pos) => size(id)(event, dir, ref, delta, pos),
    [id]
  );

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
          updateSize={updateSize}
          {...windowOptions}
        >
          <App {...loadedAppOptions} {...windowOptions} />
        </Window>
      ) : (
        <App key={id} {...loadedAppOptions} {...windowOptions} />
      )}
    </motion.article>
  );
};

export default ProcessWindow;
