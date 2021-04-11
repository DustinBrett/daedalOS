import type { Size } from 'hooks/useResizable';
import { useState } from 'react';
import type { Position } from 'react-rnd';

type WindowState = {
  position?: Position;
  size?: Size;
};

type WindowStates = {
  [id: string]: WindowState;
};

export type SessionContextState = {
  setThemeName: React.Dispatch<React.SetStateAction<string>>;
  setWindowStates: React.Dispatch<React.SetStateAction<WindowStates>>;
  themeName: string;
  windowStates: WindowStates;
};

const useSessionContextState = (): SessionContextState => {
  const [themeName, setThemeName] = useState('');
  const [windowStates, setWindowStates] = useState<WindowStates>({});

  return { setThemeName, setWindowStates, themeName, windowStates };
};

export default useSessionContextState;
