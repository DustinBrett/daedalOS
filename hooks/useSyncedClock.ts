import { useEffect } from 'react';
import { MILLISECONDS_IN_SECOND } from 'utils/constants';

const useSyncedClock = (callback: () => void): void => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      callback();
      timeoutId = setInterval(callback, MILLISECONDS_IN_SECOND);
    }, MILLISECONDS_IN_SECOND - new Date().getMilliseconds());

    return () => clearTimeout(timeoutId);
  }, [callback]);
};

export default useSyncedClock;
