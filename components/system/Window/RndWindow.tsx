import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import useRnd from 'hooks/useRnd';
import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { DEFAULT_WINDOW_SIZE } from 'utils/constants';

type RndWindowProps = {
  children: React.ReactNode;
  id: string;
};

const RndWindow = ({ children, id }: RndWindowProps): JSX.Element => {
  const {
    processes: {
      [id]: { autoSizing, maximized }
    }
  } = useProcesses();
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id, maximized);
  const { setWindowStates } = useSession();

  useEffect(() => {
    const { current } = rndRef || {};

    return () =>
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          position: current?.props?.position,
          size: autoSizing ? DEFAULT_WINDOW_SIZE : current?.props?.size
        }
      }));
  }, [autoSizing, id, setWindowStates]);

  return (
    <Rnd ref={rndRef} {...rndProps}>
      {children}
    </Rnd>
  );
};

export default RndWindow;
