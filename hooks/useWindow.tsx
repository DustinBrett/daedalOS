import {
  baseZindex,
  foregroundZindex,
  MAXIMIZE_ANIMATION_SPEED_IN_SECONDS,
  MILLISECONDS_IN_SECOND,
  TASKBAR_HEIGHT,
  windowsZindexLevel,
  zindexLevelSize
} from '@/utils/constants';
import { getMaxDimensions, getNextVisibleWindow } from '@/utils/windowmanager';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext, useEffect, useMemo, useState } from 'react';
import { windowMotionSettings } from '@/utils/motions';

const windowZindex = baseZindex + windowsZindexLevel * zindexLevelSize;

const useWindow = ({
  loaderOptions: { width: defaultWidth, height: defaultHeight },
  processProps: {
    height: initialHeight,
    id,
    launchElement,
    lockAspectRatio,
    maximized,
    minimized,
    taskbarElement,
    width: initialWidth,
    x,
    y
  }
}: any): any => {
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
  const [maximizeWindow, setMaximizeWindow] = useState(false);
  const { height, width } = getMaxDimensions(
    initialWidth,
    initialHeight,
    defaultWidth,
    defaultHeight,
    lockAspectRatio
  );
  const { x: previousX, y: previousY } = getState({
    id
  });
  const { x: defaultX, y: defaultY } = useMemo(
    () => ({
      x: Math.floor((window.innerWidth - width) / 2),
      y: Math.floor((window.innerHeight - height - TASKBAR_HEIGHT) / 2)
    }),
    []
  );
  const zIndex = windowZindex + stackOrder.slice().reverse().indexOf(id);

  useEffect(() => {
    if (foregroundId === id && minimized) {
      foreground(
        getNextVisibleWindow(
          processes,
          stackOrder.filter((stackId) => stackId !== id)
        )
      );
    } else if (!stackOrder.includes(id)) {
      foreground(getNextVisibleWindow(processes, stackOrder));
    }
  }, [foregroundId, id, minimized, processes, stackOrder]);

  useEffect(() => {
    if (maximized) {
      setMaximizeWindow(true);
    } else if (maximizeWindow) {
      setTimeout(
        () => setMaximizeWindow(false),
        MAXIMIZE_ANIMATION_SPEED_IN_SECONDS * MILLISECONDS_IN_SECOND
      );
    }
  }, [maximized, maximizeWindow]);

  return {
    height,
    width,
    zIndex: foregroundId === id ? foregroundZindex : zIndex,
    motions: windowMotionSettings({
      animation:
        (maximized && minimized && 'maxmin') ||
        (maximized && 'maximized') ||
        (minimized && 'minimized') ||
        'start',
      initialX: previousX || defaultX,
      initialY: previousY || defaultY,
      x,
      y,
      taskbarElement,
      launchElement,
      height,
      width,
      zIndex
    }),
    settings: {
      onBlur: (event: React.FocusEvent) => {
        if (event.relatedTarget !== taskbarElement) {
          foreground('');
        }
      },
      onClose: () => {
        saveState({
          id,
          height,
          width,
          x: !previousX ? defaultX + x : x,
          y: !previousY ? defaultY + y : y
        });
        close(id);
      },
      onDrag: position(id),
      onFocus: () => foreground(id),
      onMaximize: () => (maximized ? restore(id, 'maximized') : maximize(id)),
      onMinimize: () => minimize(id),
      onResize: size(id),
      height,
      id,
      lockAspectRatio,
      maximized: maximizeWindow,
      minimized,
      width,
      zIndex
    }
  };
};

export default useWindow;
