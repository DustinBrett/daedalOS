import { useTheme } from "styled-components";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { useProcess } from "contexts/process";
import { DEFAULT_WINDOW_SIZE } from "utils/constants";

const useDefaultSize = (id: string): Size => {
  const { defaultSize } = useProcess(id);
  const {
    sizes: { titleBar },
  } = useTheme();

  return defaultSize
    ? {
        height: Number(defaultSize.height) + titleBar.height,
        width: defaultSize.width,
      }
    : DEFAULT_WINDOW_SIZE;
};

export default useDefaultSize;
