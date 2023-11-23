import { useCallback, useEffect, useState } from "react";
import { useProcesses } from "contexts/process";

type History = {
  canGoBack: boolean;
  canGoForward: boolean;
  currentUrl: string;
  history: string[];
  moveHistory: (step: number) => void;
  position: number;
};

const useHistory = (url: string, id: string): History => {
  const { url: changeUrl } = useProcesses();
  const [currentUrl, setCurrentUrl] = useState(url);
  const [history, setHistory] = useState<string[]>(() => [url]);
  const [position, setPosition] = useState<number>(0);
  const moveHistory = useCallback(
    (step: number): void => {
      const newPosition = position + step;

      setPosition(newPosition);
      setCurrentUrl(history[newPosition]);
      changeUrl(id, history[newPosition]);
    },
    [changeUrl, history, id, position]
  );

  useEffect(() => {
    if (url !== currentUrl) {
      setPosition(position + 1);
      setCurrentUrl(url);
      setHistory([...history.slice(0, position + 1), url]);
    }
  }, [currentUrl, history, position, url]);

  return {
    canGoBack: position > 0,
    canGoForward: position < history.length - 1,
    currentUrl,
    history,
    moveHistory,
    position,
  };
};

export default useHistory;
