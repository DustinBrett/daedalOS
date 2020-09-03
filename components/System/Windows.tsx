import type { FC } from 'react';

import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Window } from '@/components/System/Window';
import {
  appToFocus,
  appToUnfocus,
  sortByLastRunning,
  updatePosition,
  updateSize
} from '@/utils';

export const Windows: FC = () => {
  const { apps, updateApp } = useContext(AppsContext),
    [windowMargins, setWindowMargins] = useState({
      marginTop: 0,
      marginLeft: 0
    }),
    activeApps = apps.filter(({ running }) => running).sort(sortByLastRunning),
    onMinimize = (id: string) => () =>
      updateApp({ updates: { foreground: false, minimized: true }, id }),
    onClose = (id: string, [, newForegroundAppId]: Array<string>) => () => {
      if (newForegroundAppId) {
        appToFocus(apps, updateApp, newForegroundAppId);
      }

      updateApp({ updates: { running: false, stackOrder: [] }, id });
    },
    onFocus = (id: string) => () => appToFocus(apps, updateApp, id),
    onBlur = (id: string) => () => appToUnfocus(apps, updateApp, id);

  useEffect(() => {
    setWindowMargins({
      marginTop: 50,
      marginLeft: 50
    });
  }, []);

  return (
    <section style={windowMargins}>
      {activeApps.map(
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
              onMinimize: onMinimize(id),
              onClose: onClose(id, stackOrder),
              onFocus: onFocus(id),
              onBlur: onBlur(id),
              updatePosition: updatePosition(updateApp, id),
              updateSize: updateSize(updateApp, id),
              tabIndex: apps.length + activeApps.length + index,
              zIndex: 1750 + (activeApps.length - (stackOrder.indexOf(id) + 1)),
              foreground,
              minimized,
              height,
              width,
              x: x || cascadeSpacing,
              y: y || cascadeSpacing
            };

          return windowed ? (
            <Window
              key={id}
              icon={icon}
              name={name}
              lockAspectRatio={lockAspectRatio}
              hideScrollbars={hideScrollbars}
              {...appOptions}
            >
              <App />
            </Window>
          ) : (
            <App key={id} {...appOptions} />
          );
        }
      )}
    </section>
  );
};
