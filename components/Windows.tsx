import { Window } from './Window';

import { Apps } from '../resources/apps';

export default function Windows() {
  return (
    <div>
      { Apps
        .filter(app => app.showWindow)
        .map(app => (
          <Window key={ app.id } app={ app } title={ app.title || app.name }>
            { app.component }
          </Window>
        )) }
    </div>
  );
};
