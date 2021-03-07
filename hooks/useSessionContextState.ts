import { useState } from 'react';
import type { SessionContextState } from 'types/contexts/session';

const useSessionContextState = (): SessionContextState => {
  const [themeName, setThemeName] = useState('');

  return { themeName, setThemeName };
};

export default useSessionContextState;
