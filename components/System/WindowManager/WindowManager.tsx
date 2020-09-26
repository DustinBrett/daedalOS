import type { FC } from 'react';

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
import { getMaxDimensions, CASCADE_PADDING } from '@/utils/windowmanager';

const Window = dynamic(import('@/components/System/WindowManager/Window'));

// TODO: Fix foregroundId update to next window on closing of window

export const WindowManager: FC = () => {
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
            const cascadePadding = startIndex * CASCADE_PADDING;
            const windowZindex =
              baseZindex + windowsZindexLevel * zindexLevelSize;
            const windowOptions = {
              onMinimize: () => minimize(id),
              onMaximize: () => (maximized ? restore(id) : maximize(id)),
              onClose: () => {
                saveState(id, {
                  height,
                  width,
                  x: !previousX && x ? x + cascadePadding : x,
                  y: !previousY && y ? y + cascadePadding : y
                });
                close(id);
              },
              onFocus: () => foreground(id),
              onBlur: () => foreground(''),
              updatePosition: position(id),
              zIndex: windowZindex + stackOrder.slice().reverse().indexOf(id),
              maximized,
              minimized,
              id,
              ...getMaxDimensions(
                width,
                height,
                defaultWidth,
                defaultHeight,
                lockAspectRatio
              )
            };
            const isForeground = foregroundId === id;

            return (
              <motion.div
                key={id}
                style={{
                  zIndex: isForeground ? foregroundZindex : windowOptions.zIndex
                }}
                {...windowMotionSettings({
                  // || cascadePadding is causing the glitch during min/max
                  initialX: maximized ? 0 : previousX || cascadePadding,
                  initialY: maximized ? 0 : previousY || cascadePadding,
                  startX,
                  startY,
                  animation: minimized ? 'minimized' : 'start',
                  startIndex
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
