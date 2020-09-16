import styles from '@/styles/System/Windows/Windows.module.scss';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { windowMotionSettings } from '@/utils/motions';

const Window = dynamic(import('@/components/System/Windows/Window'));

export const Windows: FC = () => {
  const {
      processes,
      close,
      maximize,
      minimize,
      position,
      restore,
      size
    } = useContext(ProcessContext),
    { session, background, foreground } = useContext(SessionContext);

  return (
    <div className={styles.windows}>
      <AnimatePresence>
        {processes.map(
          (
            {
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
            },
            index
          ) => {
            const cascadeSpacing = index * 20 || 0,
              appOptions = {
                onMinimize: () => minimize?.(id),
                onMaximize: () => (maximized ? restore?.(id) : maximize?.(id)),
                onClose: () => {
                  const nextId = close?.(id, session?.stackOrder || []);
                  if (nextId) foreground?.(nextId);
                },
                onFocus: () => foreground?.(id),
                onBlur: () => background?.(id),
                updatePosition: position?.(id),
                updateSize: size?.(id),
                zIndex:
                  1750 +
                  (processes.length -
                    ((session?.stackOrder || []).indexOf(id) + 1)),
                maximized,
                minimized,
                height,
                width,
                id,
                x: x || cascadeSpacing,
                y: y || cascadeSpacing
              },
              isForeground = session.foreground === id;

            return (
              <motion.div
                key={id}
                style={{
                  position: isForeground ? 'relative' : 'initial',
                  zIndex: isForeground ? 10000 : 1750
                }}
                {...windowMotionSettings}
              >
                {windowed ? (
                  <Window
                    icon={icon}
                    name={name}
                    bgColor={bgColor}
                    lockAspectRatio={lockAspectRatio}
                    hideScrollbars={hideScrollbars}
                    updateSize={size?.(id)}
                    {...appOptions}
                  >
                    <App {...loadedAppOptions} />
                  </Window>
                ) : (
                  <App key={id} {...appOptions} {...loadedAppOptions} />
                )}
              </motion.div>
            );
          }
        )}
      </AnimatePresence>
    </div>
  );
};

export default Windows;
