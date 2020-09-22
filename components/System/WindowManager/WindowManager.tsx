import type { FC } from 'react';

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

const CASCADE_PADDING = 25;

const Window = dynamic(import('@/components/System/WindowManager/Window'));

export const WindowManager: FC = () => (
  <div>
    <ProcessContext.Consumer>
      {({ processes, close, maximize, minimize, position, restore, size }) => (
        <SessionContext.Consumer>
          {({
            session: { stackOrder, foregroundId },
            background,
            foreground,
            getState,
            saveState
          }) => (
            <AnimatePresence>
              {processes.map(
                ({
                  loader: { loader: App, loadedAppOptions },
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
                    }),
                    cascadePadding = startIndex * CASCADE_PADDING,
                    windowZindex =
                      baseZindex + windowsZindexLevel * zindexLevelSize,
                    windowOptions = {
                      onMinimize: () =>
                        foreground(minimize(id, stackOrder), id),
                      onMaximize: () =>
                        maximized ? restore(id) : maximize(id),
                      onClose: () => {
                        saveState(id, {
                          height,
                          width,
                          x: !previousX && x ? x + cascadePadding : x,
                          y: !previousY && y ? y + cascadePadding : y
                        });
                        foreground(close(id, stackOrder), id);
                      },
                      onFocus: () => foreground(id),
                      onBlur: () => background(id),
                      updatePosition: position(id),
                      zIndex:
                        windowZindex + stackOrder.slice().reverse().indexOf(id),
                      maximized,
                      minimized,
                      height,
                      width,
                      id
                    },
                    isForeground = foregroundId === id;

                  return (
                    <motion.div
                      key={id}
                      style={{
                        position: isForeground ? 'relative' : 'absolute',
                        zIndex: isForeground
                          ? foregroundZindex
                          : windowOptions.zIndex
                      }}
                      {...windowMotionSettings({
                        initialX: previousX || cascadePadding,
                        initialY: previousY || cascadePadding,
                        startX,
                        startY
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
                          <App {...loadedAppOptions} />
                        </Window>
                      ) : (
                        <App
                          key={id}
                          {...windowOptions}
                          {...loadedAppOptions}
                        />
                      )}
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>
          )}
        </SessionContext.Consumer>
      )}
    </ProcessContext.Consumer>
  </div>
);

export default WindowManager;
