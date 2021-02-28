import { useState } from 'react';
import type { ProcessContextState, Processes } from 'types/contexts/process';

const useProcessContextState = (): ProcessContextState => {
  const [processes] = useState<Processes>({});

  return { processes };
};

export default useProcessContextState;
