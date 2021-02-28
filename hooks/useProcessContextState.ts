import { useState } from 'react';
import type { ProcessContextState, Processes } from 'types/contexts/process';
import { Taskbar } from 'utils/processDirectory';

const useProcessContextState = (): ProcessContextState => {
  const [processes] = useState<Processes>({ Taskbar });

  return { processes };
};

export default useProcessContextState;
