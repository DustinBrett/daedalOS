import { useProcesses } from "contexts/process";
import { useEffect } from "react";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    chess: {
      organize: (bool: boolean) => void;
      placeById: (id: string) => void;
      setFrameRate: (fps: number) => void;
      setPromotion: (promotion: number) => void;
      setSide: (side: number) => void;
      setView: (view: number) => void;
      useAI: (bool: boolean) => void;
      useKeyboard: (bool: boolean) => void;
    };
  }
}

const loadChess = (): void => {
  window.chess.useAI(true);
  window.chess.placeById("chessDesk");
  window.chess.setView(1);
};

const useChess = (
  id: string,
  _url: string,
  _containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();

  useEffect(() => {
    if (!loading) loadChess();
    else {
      loadFiles(libs).then(() => {
        const waitForLoad = (): number =>
          window.setTimeout(() => {
            if (window.chess) setLoading(false);
            else waitForLoad();
          }, 50);

        waitForLoad();
      });
    }
  }, [libs, loading, setLoading]);
};

export default useChess;
