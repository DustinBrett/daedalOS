import { useContext } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import {
  baseZindex,
  windowsZindexLevel,
  zindexLevelSize,
  foregroundZindex,
  CASCADE_PADDING
} from '@/utils/constants';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { windowMotionSettings } from '@/utils/motions';
import { getMaxDimensions } from '@/utils/windowmanager';

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
            const cascadePadding = startIndex * CASCADE_PADDING;
            const windowZindex =
              baseZindex + windowsZindexLevel * zindexLevelSize;
            const focusNextVisibleWindow = () => {
              const [, ...remainingStackEntries] = stackOrder;
              const visibleProcessId = remainingStackEntries.find((stackId) =>
                processes.find(
                  (process) => process.id === stackId && !process.minimized
                )
              );
              if (visibleProcessId) foreground(visibleProcessId);
            };
            const windowOptions = {
              onMinimize: () => {
                minimize(id);
                focusNextVisibleWindow();
              },
              onMaximize: () =>
                maximized ? restore(id, 'maximized') : maximize(id),
              onClose: () => {
                saveState({
                  id,
                  height,
                  width,
                  x: !previousX && x ? x + cascadePadding : x,
                  y: !previousY && y ? y + cascadePadding : y
                });
                close(id);
                focusNextVisibleWindow();
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
