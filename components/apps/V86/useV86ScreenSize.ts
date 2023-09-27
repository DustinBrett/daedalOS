import type { SizeCallback, V86Starter } from "components/apps/V86/types";
import useWindowSize from "components/system/Window/useWindowSize";
import { useEffect } from "react";

const SET_SCREEN_GFX = "screen-set-size-graphical";
const SET_SCREEN_TXT = "screen-set-size-text";

const useV86ScreenSize = (
  id: string,
  screenContainer: React.MutableRefObject<HTMLDivElement | null>,
  emulator?: V86Starter
): void => {
  const { updateWindowSize } = useWindowSize(id);

  useEffect(() => {
    const setScreenGfx: SizeCallback = ([width, height]) =>
      updateWindowSize(height, width);
    const setScreenText: SizeCallback = ([, rows]) => {
      const { height, width } =
        screenContainer.current
          ?.querySelector("span:last-of-type")
          ?.getBoundingClientRect() || {};

      if (height && width) updateWindowSize(rows * height, width);
    };

    emulator?.add_listener(SET_SCREEN_GFX, setScreenGfx);
    emulator?.add_listener(SET_SCREEN_TXT, setScreenText);

    return () => {
      emulator?.remove_listener(SET_SCREEN_GFX, setScreenGfx);
      emulator?.remove_listener(SET_SCREEN_TXT, setScreenText);
    };
  }, [emulator, screenContainer, updateWindowSize]);
};

export default useV86ScreenSize;
