import { useTheme } from "styled-components";
import { useMemo } from "react";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { useProcesses } from "contexts/process";
import { DEFAULT_WINDOW_SIZE } from "utils/constants";

const useDefaultSize = (id: string): Size => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const { defaultSize } = process || {};
  const {
    sizes: { titleBar },
  } = useTheme();

  return useMemo(
    () =>
      defaultSize
        ? {
            height: Number(defaultSize.height) + titleBar.height,
            width: defaultSize.width,
          }
        : DEFAULT_WINDOW_SIZE,
    [defaultSize, titleBar.height]
  );
};

export default useDefaultSize;
