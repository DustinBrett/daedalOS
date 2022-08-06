import { useEffect } from "react";
import { loadFiles } from "utils/functions";

const libs = [
  "Program Files/Chess/chess.js",
  "Program Files/Chess/common/xhr.js",
  "Program Files/Chess/skins/gnomechess.css",
];

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
  _id: string,
  _url: string,
  _containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
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
  }, [loading, setLoading]);
};

export default useChess;
