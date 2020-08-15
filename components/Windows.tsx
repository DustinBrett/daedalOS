import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import { Window } from './Window';

export default function Windows() {
  const { apps = {} } = useContext(AppsContext);

  // Load windows delayed to show popup actions, 100 ms setTimeouts for each window entry, and pop in animations
console.log(apps);
  return (
    <div>
      { Object.entries(apps)
          .filter(([_id, app]) => app.opened)
          .map(([id, app]) => (
            <Window key={ id } app={ app } id={ id } title={ app.name }>
              { app.component }
            </Window>
          )) }
    </div>
  );
};
