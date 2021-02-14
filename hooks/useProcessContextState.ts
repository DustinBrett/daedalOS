import { useState } from 'react';
import type { ProcessContextState } from 'types/contexts/process';
import { Taskbar } from 'utils/processDirectory';

const useProcessContextState = (): ProcessContextState => {
  const [processes] = useState({ Taskbar });

  return { processes };
};

export default useProcessContextState;
