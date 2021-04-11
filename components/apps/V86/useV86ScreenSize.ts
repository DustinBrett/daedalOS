import type { EventCallback, V86Starter } from 'components/apps/V86/types';
import { useSession } from 'contexts/session';
import { stripUnit } from 'polished';
import type { CSSProperties } from 'react';
import { useCallback, useEffect } from 'react';
import { useTheme } from 'styled-components';

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
      updateWindowSize(height + Number(stripUnit(titleBar.height)), width),
    [titleBar.height, updateWindowSize]
  );

  const setScreenText = useCallback<EventCallback>(
    ([cols, rows]) =>
      updateWindowSize(
        rows * Number(stripUnit(lineHeight)) +
          Number(stripUnit(titleBar.height)) +
          BORDER_OFFSET,
        (cols / 2 + 4) * Number(stripUnit(lineHeight))
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
