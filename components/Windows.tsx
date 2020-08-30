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
      {activeApps.map(({ component: App, id, name, withWindow }, index) =>
        withWindow ? (
          <Window
            key={id}
            name={name}
            onMinimize={onMinimize(id)}
            onClose={onClose(id)}
            onFocus={onFocus(id)}
            onBlur={onBlur(id)}
            tabIndex={apps.length * 2 + index}
          >
            <App />
          </Window>
        ) : (
          <App key={id} onMinimize={onMinimize(id)} onClose={onClose(id)} />
        )
      )}
    </section>
  );
};
