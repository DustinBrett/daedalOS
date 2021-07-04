import type {
  ModeCallback,
  SizeCallback,
  V86Starter,
} from "components/apps/V86/types";
import useWindowSize from "components/system/Window/useWindowSize";
import { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import { pxToNum } from "utils/functions";

const SET_SCREEN_MODE = "screen-set-mode";
const SET_SCREEN_GFX = "screen-set-size-graphical";
const SET_SCREEN_TXT = "screen-set-size-text";

const useV86ScreenSize = (
  id: string,
  emulator?: V86Starter
): React.CSSProperties => {
  const {
    sizes: {
      window: { lineHeight },
    },
  } = useTheme();
  const { updateWindowSize } = useWindowSize(id);
  const [isGraphical, setIsGraphical] = useState(false);

  useEffect(() => {
    const setScreenMode: ModeCallback = (isGfxMode) =>
      setIsGraphical(isGfxMode);
    const setScreenGfx: SizeCallback = ([width, height]) =>
      updateWindowSize(height, width);
    const setScreenText: SizeCallback = ([cols, rows]) =>
      updateWindowSize(
        rows * pxToNum(lineHeight) + 3, // Why + 3?
        (cols / 2 + 4) * pxToNum(lineHeight) // Why + 4?
      );

    emulator?.add_listener?.(SET_SCREEN_MODE, setScreenMode);
    emulator?.add_listener?.(SET_SCREEN_GFX, setScreenGfx);
    emulator?.add_listener?.(SET_SCREEN_TXT, setScreenText);

    return () => {
      emulator?.remove_listener?.(SET_SCREEN_MODE, setScreenMode);
      emulator?.remove_listener?.(SET_SCREEN_GFX, setScreenGfx);
      emulator?.remove_listener?.(SET_SCREEN_TXT, setScreenText);
    };
  }, [emulator, lineHeight, updateWindowSize]);

  return {
    font: `${lineHeight} monospace`,
    lineHeight,
    position: "relative",
    top: isGraphical ? "" : "2px", // Why + 2?
  };
};

export default useV86ScreenSize;
