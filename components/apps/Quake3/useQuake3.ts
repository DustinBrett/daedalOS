import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect } from "react";
import { useTheme } from "styled-components";
import { loadFiles, pxToNum } from "utils/functions";

declare global {
  interface Window {
    AL?: {
      contexts: {
        ctx: AudioContext;
      }[];
    };
    ioq3?: {
      callMain: (args: string[]) => void;
      elementPointerLock: boolean;
      exit: () => void;
      exitHandler: (error: Error | null) => void;
      setCanvasSize: (width: number, height: number) => void;
      viewport: HTMLDivElement | null;
    };
  }
}

const useQuake3 = (
  id: string,
  _url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
  const {
    windowStates: { [id]: windowState },
  } = useSession();
  const {
    sizes: { titleBar },
  } = useTheme();
  const { size } = windowState || {};

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (!window.ioq3) return;

      window.ioq3.viewport = containerRef.current;
      window.ioq3.elementPointerLock = true;
      window.ioq3.callMain([]);

      setLoading(false);
    });
  }, [containerRef, libs, setLoading]);

  useEffect(() => {
    if (!window.ioq3) return;

    window.ioq3.setCanvasSize(
      pxToNum(size?.width),
      pxToNum(size?.height) - titleBar.height
    );
  }, [setLoading, size, titleBar.height]);

  useEffect(
    () => () => {
      try {
        window.ioq3?.exit();
      } catch {
        // Ignore error on exit
      }

      window.AL?.contexts.forEach(({ ctx }) => ctx.close());
    },
    []
  );
};

export default useQuake3;
