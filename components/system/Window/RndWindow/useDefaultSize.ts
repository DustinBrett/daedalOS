import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useProcesses } from "contexts/process";
import { useTheme } from "styled-components";
import { DEFAULT_WINDOW_SIZE } from "utils/constants";
import { pxToNum } from "utils/functions";

const useDefaultSize = (id: string): Size => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const { defaultSize } = process || {};
  const {
    sizes: { titleBar },
  } = useTheme();

  return defaultSize
    ? {
        height: Number(defaultSize.height) + pxToNum(titleBar.height),
        width: defaultSize.width,
      }
    : DEFAULT_WINDOW_SIZE;
};

export default useDefaultSize;
