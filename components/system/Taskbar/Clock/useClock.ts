import { useEffect, useState } from 'react';
import { MILLISECONDS_IN_SECOND } from 'utils/constants';

const useClock = (): Date => {
  const [now, setNow] = useState(new Date());
  const updateClock = () => setNow(new Date());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      updateClock();
      timeoutId = setInterval(updateClock, MILLISECONDS_IN_SECOND);
    }, MILLISECONDS_IN_SECOND - new Date().getMilliseconds());

    return () => clearTimeout(timeoutId);
  }, []);

  return now;
};

export default useClock;
