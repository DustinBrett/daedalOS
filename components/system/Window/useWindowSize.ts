import { useSession } from 'contexts/session';
import { stripUnit } from 'polished';
import { useCallback } from 'react';
import { useTheme } from 'styled-components';

type WindowSize = {
  updateWindowSize: (height: number, width: number) => void;
};

const useWindowSize = (id: string): WindowSize => {
  const { setWindowStates } = useSession();
  const {
    sizes: { titleBar }
  } = useTheme();

  const updateWindowSize = useCallback(
    (height: number, width: number) =>
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          size: {
            height: height + Number(stripUnit(titleBar.height)),
            width
          }
        }
      })),
    [id, setWindowStates, titleBar.height]
  );

  return {
    updateWindowSize
  };
};

export default useWindowSize;
