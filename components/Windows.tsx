import type { FC } from 'react';
import { useContext, useEffect, useState } from 'react';
import { Apps, AppsContext } from '@/contexts/Apps';
import { Window } from '@/components/Window';

// TODO: REORDER ON SELECTION ZINDEX/FOREGROUND/STACK
// A State that pops id's into an array and removes them when app is closed

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
    onClose = (id: string) => () =>
      updateApps({ update: { running: false }, id }),
    onFocus = (id: string) => () =>
      updateApps({ update: { foreground: true }, id }),
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
            foreground,
            lockAspectRatio,
            hideScrollbars
          },
          index
        ) =>
          windowed ? (
            <Window
              key={id}
              name={name}
              onMinimize={onMinimize(id)}
              onClose={onClose(id)}
              onFocus={onFocus(id)}
              onBlur={onBlur(id)}
              lockAspectRatio={lockAspectRatio}
              hideScrollbars={hideScrollbars}
              tabIndex={apps.length * 2 + index} // TODO: Are all tabindexes correct?
              zIndex={1750 + apps.length + (foreground ? 1 : 0)} // TODO: Stacking logic
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
              zIndex={1750 + apps.length + (foreground ? 1 : 0)} // TODO: Stacking logic
            />
          )
      )}
    </section>
  );
};
