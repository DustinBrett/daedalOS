import styles from '@/styles/System/Windows/Windows.module.scss';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { ProcessContext } from '@/contexts/ProcessManager';
import { AnimatePresence, motion } from 'framer-motion';
import { SessionContext } from '@/contexts/SessionManager';

const Window = dynamic(import('@/components/System/Windows/Window'));

const windowMotionSettings = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.5
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const Windows: FC = () => {
  const {
      processes,
      close,
      focus,
      maximize,
      minimize,
      position,
      size
    } = useContext(ProcessContext),
    { background, foreground } =  useContext(SessionContext);

  return (
    <article className={styles.windows}>
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
              stackOrder,
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
                onClose: () => close?.(id, stackOrder),
                onFocus: () => focus?.(id) && foreground?.(id),
                onBlur: () => focus?.(id, false) && background?.(id),
                updatePosition: position?.(id),
                updateSize: size?.(id),
                zIndex:
                  1750 + (processes.length - (stackOrder.indexOf(id) + 1)),
                maximized,
                minimized,
                height,
                width,
                x: x || cascadeSpacing,
                y: y || cascadeSpacing
              };

            return (
              <motion.div key={id} {...windowMotionSettings}>
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
    </article>
  );
};

export default Windows;
