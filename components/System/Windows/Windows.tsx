import styles from '@/styles/System/Windows/Windows.module.scss';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { ProcessContext } from '@/contexts/ProcessManager';
import { AnimatePresence, motion } from 'framer-motion';
import { SessionContext } from '@/contexts/SessionManager';

const Window = dynamic(import('@/components/System/Windows/Window'));

const windowMotionSettings = {
  initial: { scale: 0, x: -250, y: -300 },
  animate: { scale: 1, x: 0, y: 0 },
  transition: {
    duration: 0.25,
    y: {
      type: 'spring',
      damping: 10,
      mass: 0.6
    }
  },
  exit: {
    scale: 0,
    x: -250,
    y: -300
  }
};

export const Windows: FC = () => {
  const { processes, close, maximize, minimize, position, size } = useContext(
      ProcessContext
    ),
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
                onMaximize: () => maximize?.(id, !maximized),
                onClose: () => {
                  const nextId = close?.(id, session?.stackOrder || []); // Q: Do I need `session?.` ?
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
              };

            return (
              <motion.div
                key={id}
                {...windowMotionSettings}
                style={{
                  position: session.foreground === id ? 'relative' : 'initial',
                  zIndex: session.foreground === id ? 10000 : 1750
                }}
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
