import type { FC } from 'react';
import { useContext, useEffect, useState } from 'react';
import { Apps, AppsContext } from '@/contexts/Apps';
import { Window } from '@/components/Window';

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
      // TODO: updateApps accept multi args
      updateApps({ update: { running: false }, id });
      updateApps({ update: { stackOrder: [] }, id });
    },
    onFocus = (id: string) => () => {
      updateApps({ update: { foreground: true }, id });
      // TODO: Storing stack in every app is silly, fix this somehow
      apps.forEach(({ id: appId, stackOrder }) => {
        updateApps({
          update: {
            stackOrder: [
              id,
              ...stackOrder.filter((windowId: string) => windowId !== id)
            ]
          },
          id: appId
        });
      });
    },
    onBlur = (id: string) => () =>
      updateApps({ update: { foreground: false }, id });

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
            stackOrder
          },
          index
        ) => {
          const zIndex = 1750 + (activeApps.length - stackOrder.indexOf(id)),
            tabIndex = apps.length + activeApps.length + index;

          return windowed ? (
            <Window
              key={id}
              name={name}
              onMinimize={onMinimize(id)}
              onClose={onClose(id)}
              onFocus={onFocus(id)}
              onBlur={onBlur(id)}
              lockAspectRatio={lockAspectRatio}
              hideScrollbars={hideScrollbars}
              tabIndex={tabIndex}
              zIndex={zIndex}
            >
              <App />
            </Window>
          ) : (
            <App
              key={id}
              onMinimize={onMinimize(id)}
              onClose={onClose(id)}
              onFocus={onFocus(id)}
              onBlur={onBlur(id)}
              tabIndex={tabIndex}
              zIndex={zIndex}
            />
          );
        }
      )}
    </section>
  );
};
