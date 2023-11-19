import { useTheme } from "styled-components";
import { useCallback } from "react";
import { minMaxSize } from "components/system/Window/functions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

type WindowSize = {
  updateWindowSize: (height: number, width: number) => void;
};

const useWindowSize = (id: string): WindowSize => {
  const { setWindowStates } = useSession();
  const {
    processes: {
      [id]: { lockAspectRatio = false, maximized = false } = {},
    } = {},
  } = useProcesses();
  const {
    sizes: { titleBar },
  } = useTheme();

  const updateWindowSize = useCallback(
    (height: number, width: number) =>
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          ...currentWindowStates?.[id],
          maximized,
          size: minMaxSize(
            {
              height: height + titleBar.height,
              width,
            },
            lockAspectRatio
          ),
        },
      })),
    [id, lockAspectRatio, maximized, setWindowStates, titleBar.height]
  );

  return {
    updateWindowSize,
  };
};

export default useWindowSize;
