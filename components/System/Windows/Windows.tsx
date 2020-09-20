import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { windowMotionSettings } from '@/utils/motions';

const Window = dynamic(import('@/components/System/Windows/Window'));

// TODO: Do I need to pass x/y to Rnd? If so, only default?

export const Windows: FC = () => (
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
                  y
                }) => {
                  const { x: initialX = 0, y: initialY = 0 } = getState(name),
                    windowOptions = {
                      onMinimize: () =>
                        foreground(minimize(id, stackOrder || [])), // TODO: Min drops stack to end, then foreground(stackOrder[0])
                      onMaximize: () =>
                        maximized ? restore(id) : maximize(id),
                      onClose: () => {
                        saveState(id, { height, width, x, y });
                        foreground(close(id, stackOrder || [])); // TODO: Same change as onMin
                      },
                      onFocus: () => foreground(id),
                      onBlur: () => background(id),
                      updatePosition: position(id),
                      // TODO: Remove when adding session and redoing css
                      zIndex:
                        1750 +
                        (processes.length -
                          ((stackOrder || []).indexOf(id) + 1)),
                      maximized,
                      minimized,
                      height,
                      width,
                      id,
                      // TODO: Can I get rid of the need to pass position to Rnd?
                      // TODO: updatePosition needs to know if cascade spacing was used?
                      // TODO: Or maybe Rnd could have x/y defaults to handle cascade
                      x: initialX === x ? 0 : x,
                      y: initialY === y ? 0 : y
                    },
                    isForeground = foregroundId === id;

                  return (
                    <motion.div
                      key={id}
                      style={{
                        position: isForeground ? 'relative' : 'initial',
                        zIndex: isForeground ? 10000 : 1750
                      }}
                      {...windowMotionSettings}
                      animate={{ scale: 1, x: initialX, y: initialY }}
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

export default Windows;
