import { useContext } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import {
  baseZindex,
  windowsZindexLevel,
  zindexLevelSize,
  foregroundZindex
} from '@/utils/constants';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { windowMotionSettings } from '@/utils/motions';
import {
  focusNextVisibleWindow,
  getMaxDimensions
} from '@/utils/windowmanager';

const Window = dynamic(import('@/components/System/WindowManager/Window'));

export const WindowManager: React.FC = () => {
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

  return (
    <div>
      <AnimatePresence>
        {processes.map(
          ({
            loader: {
              loader: App,
              loadedAppOptions,
              loaderOptions: { width: defaultWidth, height: defaultHeight }
            },
            id,
            icon,
            name,
            bgColor,
            windowed,
            maximized,
            minimized,
            lockAspectRatio,
            hideScrollbars,
            height,
            width,
            x,
            y,
            startX,
            startY,
            startIndex
          }) => {
            const { x: previousX = 0, y: previousY = 0 } = getState({
              id
            });
            const windowZindex =
              baseZindex + windowsZindexLevel * zindexLevelSize;
            const windowOptions = {
              onMinimize: () => {
                minimize(id);
                focusNextVisibleWindow(stackOrder, processes, foreground);
              },
              onMaximize: () =>
                maximized ? restore(id, 'maximized') : maximize(id),
              onClose: () => {
                saveState({
                  id,
                  height,
                  width,
                  x,
                  y
                });
                close(id);
                focusNextVisibleWindow(stackOrder, processes, foreground);
              },
              onFocus: () => foreground(id),
              onBlur: () => foreground(''),
              updatePosition: position(id),
              zIndex: windowZindex + stackOrder.slice().reverse().indexOf(id),
              maximized,
              minimized,
              id,
              height,
              width
            };

            return (
              <motion.div
                key={id}
                style={{
                  zIndex:
                    foregroundId === id
                      ? foregroundZindex
                      : windowOptions.zIndex,
                  ...getMaxDimensions(
                    width,
                    height,
                    defaultWidth,
                    defaultHeight,
                    lockAspectRatio
                  )
                }}
                {...windowMotionSettings({
                  initialX: previousX,
                  initialY: previousY,
                  startX,
                  startY,
                  animation:
                    (minimized && 'minimized') ||
                    (maximized && 'maximized') ||
                    'start',
                  startIndex,
                  height,
                  width,
                  x,
                  y
                })}
              >
                {windowed ? (
                  <Window
                    icon={icon}
                    name={name}
                    bgColor={bgColor}
                    lockAspectRatio={lockAspectRatio}
                    hideScrollbars={hideScrollbars}
                    updateSize={size(id)}
                    {...windowOptions}
                  >
                    <App {...loadedAppOptions} {...windowOptions} />
                  </Window>
                ) : (
                  <App key={id} {...windowOptions} {...loadedAppOptions} />
                )}
              </motion.div>
            );
          }
        )}
      </AnimatePresence>
    </div>
  );
};

export default WindowManager;
