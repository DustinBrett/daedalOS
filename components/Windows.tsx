import type { WindowObject } from './Window';
import { Window } from './Window';

export default function Windows({ windows = [] }) {
  return (
    <div>
      { windows.map((window: WindowObject) =>
        <Window key={ window.id } { ...window } />) }
    </div>
  );
};
