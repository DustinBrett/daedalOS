import type { EventCallback, V86Starter } from 'components/apps/V86/types';
import { useSession } from 'contexts/session';
import { useCallback, useEffect } from 'react';
import type { CSSProperties } from 'styled-components';
import { useTheme } from 'styled-components';
import { pxToNumber } from 'utils/stringFunctions';

const SET_SCREEN_GFX = 'screen-set-size-graphical';
const SET_SCREEN_TXT = 'screen-set-size-text';

const BORDER_OFFSET = 3;

const useV86ScreenSize = (
  id: string,
  emulator: V86Starter | null
): CSSProperties => {
  const { setWindowStates } = useSession();
  const {
    sizes: {
      titleBar,
      window: { lineHeight }
    }
  } = useTheme();

  const updateWindowSize = useCallback(
    (height: number, width: number) =>
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          size: { height, width }
        }
      })),
    [id, setWindowStates]
  );

  const setScreenGfx = useCallback<EventCallback>(
    ([width, height]) =>
      updateWindowSize(height + pxToNumber(titleBar.height), width),
    [titleBar.height, updateWindowSize]
  );

  const setScreenText = useCallback<EventCallback>(
    ([cols, rows]) =>
      updateWindowSize(
        rows * pxToNumber(lineHeight) +
          pxToNumber(titleBar.height) +
          BORDER_OFFSET,
        (cols / 2 + 4) * pxToNumber(lineHeight)
      ),
    [lineHeight, titleBar.height, updateWindowSize]
  );

  useEffect(() => {
    emulator?.add_listener?.(SET_SCREEN_GFX, setScreenGfx);
    emulator?.add_listener?.(SET_SCREEN_TXT, setScreenText);

    return () => {
      emulator?.remove_listener?.(SET_SCREEN_GFX, setScreenGfx);
      emulator?.remove_listener?.(SET_SCREEN_TXT, setScreenText);
    };
  }, [emulator, setScreenGfx, setScreenText]);

  return {
    font: `${lineHeight} monospace`,
    lineHeight,
    position: 'relative',
    top: BORDER_OFFSET - 1
  };
};

export default useV86ScreenSize;
