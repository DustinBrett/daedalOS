import type { FC } from 'react';

import { useContext, useEffect, useState } from 'react';
import { Apps, AppsContext } from '@/contexts/Apps';
import { Window } from '@/components/System/Window';
import { appToFocus, updatePosition, updateSize } from 'utils/utils';

export const Windows: FC = () => {
  const { apps, updateApps } = useContext(AppsContext),
    [windowMargins, setWindowMargins] = useState({
      marginTop: 0,
      marginLeft: 0
    }),
    activeApps: Apps = apps.filter(
      ({ running, minimized }) => running && !minimized
    ),
    onMinimize = (id: string) => () =>
      updateApps({ update: { minimized: true }, id }),
    onClose = (id: string) => () => {
      updateApps({ update: { running: false }, id });
      updateApps({ update: { stackOrder: [] }, id });
    },
    onFocus = (id: string) => () => appToFocus(apps, updateApps, id);

  useEffect(() => {
    setWindowMargins({
      marginTop: window.innerHeight * 0.075,
      marginLeft: window.innerWidth * 0.075
    });
  }, []);

  return (
    <section style={windowMargins}>
      {activeApps.map(
        (
          {
            component: App,
            id,
            name,
            windowed,
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
          const appOptions = {
            onMinimize: onMinimize(id),
            onClose: onClose(id),
            onFocus: onFocus(id),
            updatePosition: updatePosition(updateApps, id),
            updateSize: updateSize(updateApps, id),
            tabIndex: apps.length + activeApps.length + index,
            zIndex: 1750 + (activeApps.length - (stackOrder.indexOf(id) + 1)),
            height,
            width,
            x,
            y
          };

          return windowed ? (
            <Window
              key={id}
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
