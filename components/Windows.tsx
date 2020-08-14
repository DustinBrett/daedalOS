import type { Apps } from '../resources/apps';

import { Window } from './Window';

type WindowsType = {
  appsState: [Apps, Function]
};

export default function Windows({ appsState: [apps, setApps] }: WindowsType) {
  return (
    <div>
      { Object.entries(apps)
          .filter(([_id, app]) => app.showWindow)
          .map(([id, app]) => (
            <Window key={ id } app={ app } id={ id } title={ app.name } appsState={ [apps, setApps] }>
              { app.component }
            </Window>
          )) }
    </div>
  );
};
