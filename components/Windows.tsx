import type { FC } from 'react';
import { AppsContext } from '../contexts/Apps';
import { useContext } from 'react';
import { Window } from './Window';

export const Windows: FC = () => {
  const { apps, updateApps } = useContext(AppsContext);

  return (
    <ol>
      {apps
        .filter(({ running, minimized }) => running && !minimized)
        .map(({ component: App, id, name }, index) => (
          <Window
            key={id}
            name={name}
            onMinimize={() => updateApps({ update: { minimized: true }, id })}
            onClose={() => updateApps({ update: { running: false }, id })} // TODO: Need to reset states on close?
            onFocus={() => updateApps({ update: { foreground: true }, id })}
            onBlur={() => updateApps({ update: { foreground: false }, id })}
            tabIndex={apps.length * 2 + index}
          >
            <App />
          </Window>
        ))}
    </ol>
  );
};
