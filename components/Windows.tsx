import type { FC } from 'react';
import { useContext } from 'react';
import { AppsContext } from '@/contexts/Apps';
import { Window } from '@/components/Window';

export const Windows: FC = () => {
  const { apps, updateApps } = useContext(AppsContext),
    activeApps = apps.filter(({ running, minimized }) => running && !minimized);

  return (
    <ol>
      {activeApps.map(({ component: App, id, name }, index) => (
        <Window
          key={id}
          name={name}
          onMinimize={() => updateApps({ update: { minimized: true }, id })}
          onClose={() => updateApps({ update: { running: false }, id })}
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
