import Window from './Window';

export default function Windows({ windows = [] }) {
  return (
    <div>
      { windows.map(window =>
        <Window key={ window.id } { ...window } />) }
    </div>
  );
};
