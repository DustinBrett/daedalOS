import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { sortByLastRunning } from '@/utils/utils';
import { AnimatePresence, motion } from 'framer-motion';

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
  const { apps, close, focus, maximize, minimize, position, size } = useContext(
      AppsContext
    ),
    [windowMargins, setWindowMargins] = useState({
      marginTop: 0,
      marginLeft: 0
    });

  useEffect(() => {
    setWindowMargins({
      marginTop: 50,
      marginLeft: 50
    });
  }, []);

  return (
    // TODO: Maybe I should use <article>?
    // W3C: Section lacks heading. Consider using h2-h6 elements to add identifying headings to all sections.
    // https://www.w3.org/wiki/HTML/Usage/Headings/Missing
    <section style={windowMargins}>
      <AnimatePresence>
        {apps
          ?.sort(sortByLastRunning)
          .map(
            (
              {
                loader: { loader: App, loadedAppOptions },
                id,
                icon,
                name,
                windowed,
                maximized,
                minimized,
                foreground,
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
                  onFocus: () => focus?.(id),
                  onBlur: () => focus?.(id, false),
                  updatePosition: position?.(id),
                  updateSize: size?.(id),
                  zIndex: 1750 + (apps.length - (stackOrder.indexOf(id) + 1)), // TODO: Still valid logic?
                  foreground,
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
    </section>
  );
};

export default Windows;
