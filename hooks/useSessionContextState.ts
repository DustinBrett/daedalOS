import { useState } from 'react';

export type SessionContextState = {
  themeName: string;
  setThemeName: React.Dispatch<React.SetStateAction<string>>;
};

const useSessionContextState = (): SessionContextState => {
  const [themeName, setThemeName] = useState('');

  return { themeName, setThemeName };
};

export default useSessionContextState;
