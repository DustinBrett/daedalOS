import type { WindowType } from './Window';
import { Window } from './Window';

type WindowsType = {
  windows: Array<WindowType>
}

export default function Windows({ windows }: WindowsType) {
  return (
    <div>
      { windows.map((window: WindowType) =>
        <Window key={ window.id } { ...window } />) }
    </div>
  );
};
