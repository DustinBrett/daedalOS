import useSyncedClock from 'hooks/useSyncedClock';
import { useCallback, useState } from 'react';

const useClock = (): Date => {
  const [now, setNow] = useState(new Date());
  const updateClock = useCallback(() => setNow(new Date()), []);

  useSyncedClock(updateClock);

  return now;
};

export default useClock;
