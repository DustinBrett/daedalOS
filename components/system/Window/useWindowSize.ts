import { useTheme } from "styled-components";
import { minMaxSize } from "components/system/Window/functions";
import { useProcess } from "contexts/process";
import { useSessionActions } from "contexts/session";

type WindowSize = {
  updateWindowSize: (height: number, width: number) => void;
};

const useWindowSize = (id: string): WindowSize => {
  const { setWindowStates } = useSessionActions();
  const { lockAspectRatio = false } = useProcess(id);
  const {
    sizes: { titleBar },
  } = useTheme();

  const updateWindowSize = (height: number, width: number): void =>
    setWindowStates((currentWindowStates) => ({
      ...currentWindowStates,
      [id]: {
        ...currentWindowStates?.[id],
        size: minMaxSize(
          {
            height: height + titleBar.height,
            width,
          },
          lockAspectRatio,
          titleBar.height
        ),
      },
    }));

  return {
    updateWindowSize,
  };
};

export default useWindowSize;
