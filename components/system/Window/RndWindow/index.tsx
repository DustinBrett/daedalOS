import useRnd from 'components/system/Window/RndWindow/useRnd';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';

type RndWindowProps = {
  children: React.ReactNode;
  id: string;
  style: CSSProperties;
};

const reRouteFocus =
  (focusElement?: HTMLElement) =>
  (element?: Element): void => {
    element?.setAttribute('tabindex', '-1');
    element?.addEventListener('mousedown', (event) => {
      event.preventDefault();
      focusElement?.focus();
    });
  };

const RndWindow = ({ children, id, style }: RndWindowProps): JSX.Element => {
  const {
    processes: { [id]: { maximized = false } = {} }
  } = useProcesses();
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id, maximized);
  const { setWindowStates } = useSession();

  useEffect(() => {
    const { current: currentWindow } = rndRef || {};
    const [windowContainer, resizeHandleContainer] =
      currentWindow?.resizableElement?.current?.children || [];
    const resizeHandles = [...resizeHandleContainer?.children];

    resizeHandles.forEach(reRouteFocus(windowContainer as HTMLElement));

    return () =>
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          position: currentWindow?.props?.position,
          size: currentWindow?.props?.size
        }
      }));
  }, [id, maximized, setWindowStates]);

  return (
    <Rnd ref={rndRef} style={style} {...rndProps}>
      {children}
    </Rnd>
  );
};

export default RndWindow;
