import useRnd from 'components/system/Window/RndWindow/useRnd';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { DEFAULT_WINDOW_SIZE } from 'utils/constants';

type RndWindowProps = {
  children: React.ReactNode;
  id: string;
  style: CSSProperties;
};

const reRouteFocus = (focusElement?: HTMLElement) => (
  element?: Element
): void => {
  element?.setAttribute('tabindex', '-1');
  element?.addEventListener('mousedown', (event) => {
    event.preventDefault();
    focusElement?.focus();
  });
};

const RndWindow = ({ children, id, style }: RndWindowProps): JSX.Element => {
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
    const [windowContainer, resizeHandleContainer] =
      current?.resizableElement?.current?.children || [];
    const resizeHandles = [...resizeHandleContainer?.children];

    resizeHandles.forEach(reRouteFocus(windowContainer as HTMLElement));

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
    <Rnd ref={rndRef} style={style} {...rndProps}>
      {children}
    </Rnd>
  );
};

export default RndWindow;
