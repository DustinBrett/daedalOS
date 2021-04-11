import { useCallback, useRef } from 'react';

type DoubleClick = (
  handler: React.MouseEventHandler,
  timeout?: number
) => React.MouseEventHandler;

const useDoubleClick: DoubleClick = (handler, timeout = 500) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const onClick = useCallback<React.MouseEventHandler>(
    (event) => {
      if (!timer.current) {
        timer.current = setTimeout(() => {
          timer.current = null;
        }, timeout);
      } else {
        clearTimeout(timer.current);
        handler(event);
        timer.current = null;
      }
    },
    [handler, timeout]
  );

  return onClick;
};

export default useDoubleClick;
