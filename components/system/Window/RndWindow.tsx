import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import useRnd from 'hooks/useRnd';
import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';

type RndWindowProps = {
  children: React.ReactNode;
  id: string;
};

const RndWindow = ({ children, id }: RndWindowProps): JSX.Element => {
  const {
    processes: {
      [id]: { maximized }
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
          size: current?.props?.size
        }
      }));
  }, [id, setWindowStates]);

  return (
    <Rnd ref={rndRef} {...rndProps}>
      {children}
    </Rnd>
  );
};

export default RndWindow;
