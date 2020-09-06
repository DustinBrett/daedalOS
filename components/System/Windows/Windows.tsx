import type { FC } from 'react';

import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Window } from '@/components/System/Windows/Window';
import { sortByLastRunning } from '@/utils/utils';

export const Windows: FC = () => {
  const { apps, close, focus, minimize, position, size } = useContext(
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
    <section style={windowMargins}>
      {apps
        ?.sort(sortByLastRunning)
        .map(
          (
            {
              component: App,
              id,
              icon,
              name,
              windowed,
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
                onClose: () => close?.(id, stackOrder),
                onFocus: () => focus?.(id),
                onBlur: () => focus?.(id, false),
                updatePosition: position?.(id),
                updateSize: size?.(id),
                zIndex: 1750 + (apps.length - (stackOrder.indexOf(id) + 1)), // TODO: Still valid logic?
                foreground,
                minimized,
                height,
                width,
                x: x || cascadeSpacing,
                y: y || cascadeSpacing
              };

            return (
              //windowed ? (
              <Window
                key={id}
                icon={icon}
                name={name}
                lockAspectRatio={lockAspectRatio}
                hideScrollbars={hideScrollbars}
                updateSize={size?.(id)}
                {...appOptions}
              >
                {App}
              </Window>
              // ) : (
              //   <App key={id} {...appOptions} />
            );
          }
        )}
    </section>
  );
};
