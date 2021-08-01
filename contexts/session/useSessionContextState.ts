import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useFileSystem } from "contexts/fileSystem";
import { useCallback, useEffect, useState } from "react";
import type { Position } from "react-rnd";

export type WindowState = {
  position?: Position;
  size?: Size;
};

type WindowStates = {
  [id: string]: WindowState;
};

export type SessionContextState = {
  blurEntry: (entry: string) => void;
  focusEntry: (entry: string) => void;
  focusedEntries: string[];
  foregroundId: string;
  prependToStack: (id: string) => void;
  removeFromStack: (id: string) => void;
  setForegroundId: React.Dispatch<React.SetStateAction<string>>;
  setThemeName: React.Dispatch<React.SetStateAction<string>>;
  setWindowStates: React.Dispatch<React.SetStateAction<WindowStates>>;
  stackOrder: string[];
  startMenuVisible: boolean;
  themeName: string;
  toggleStartMenu: (showMenu?: boolean) => void;
  windowStates: WindowStates;
};

const SESSION_FILE = "/session.json";

const useSessionContextState = (): SessionContextState => {
  const { fs } = useFileSystem();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [foregroundId, setForegroundId] = useState("");
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const [themeName, setThemeName] = useState("");
  const [windowStates, setWindowStates] = useState<WindowStates>({});
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const toggleStartMenu = (showMenu?: boolean) =>
    setStartMenuVisible((currentMenuState) => showMenu ?? !currentMenuState);
  const prependToStack = useCallback(
    (id: string) =>
      setStackOrder((currentStackOrder) => [
        id,
        ...currentStackOrder.filter((stackId) => stackId !== id),
      ]),
    []
  );
  const removeFromStack = useCallback(
    (id: string) =>
      setStackOrder((currentStackOrder) =>
        currentStackOrder.filter((stackId) => stackId !== id)
      ),
    []
  );
  const [focusedEntries, setFocusedEntries] = useState<string[]>([]);
  const blurEntry = (entry: string) =>
    setFocusedEntries((currentFocusedEntries) =>
      currentFocusedEntries.filter((focusedEntry) => focusedEntry !== entry)
    );
  const focusEntry = (entry: string) =>
    setFocusedEntries((currentFocusedEntries) => [
      ...currentFocusedEntries,
      entry,
    ]);

  useEffect(() => {
    if (sessionLoaded) {
      fs?.writeFile(
        SESSION_FILE,
        JSON.stringify({
          foregroundId,
          stackOrder,
          themeName,
          windowStates,
        })
      );
    }
  }, [fs, foregroundId, sessionLoaded, stackOrder, themeName, windowStates]);

  useEffect(
    () =>
      fs?.readFile(SESSION_FILE, (_error, contents) => {
        if (contents) {
          const session = JSON.parse(contents.toString() || "{}");

          setThemeName(session.themeName);
          setWindowStates(session.windowStates);
        }

        setSessionLoaded(true);
      }),
    [fs]
  );

  return {
    blurEntry,
    focusEntry,
    focusedEntries,
    foregroundId,
    prependToStack,
    removeFromStack,
    setForegroundId,
    setThemeName,
    setWindowStates,
    stackOrder,
    startMenuVisible,
    themeName,
    toggleStartMenu,
    windowStates,
  };
};

export default useSessionContextState;
