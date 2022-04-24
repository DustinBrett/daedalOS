import type { SortBy } from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import type {
  ClockSource,
  SessionContextState,
  SessionData,
  SortOrders,
  WallpaperFit,
  WindowStates,
} from "contexts/session/types";
import { useCallback, useEffect, useState } from "react";
import type { ThemeName } from "styles/themes";
import { DEFAULT_THEME } from "utils/constants";

const SESSION_FILE = "/session.json";

const useSessionContextState = (): SessionContextState => {
  const { exists, readFile, writeFile } = useFileSystem();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [foregroundId, setForegroundId] = useState("");
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);
  const [clockSource, setClockSource] = useState<ClockSource>("local");
  const [windowStates, setWindowStates] = useState<WindowStates>({});
  const [sortOrders, setSortOrders] = useState<SortOrders>({});
  const [wallpaperFit, setWallpaperFit] = useState<WallpaperFit>("fill");
  const [wallpaperImage, setWallpaperImage] = useState("VANTA");
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
  const setWallpaper = (image: string, fit?: WallpaperFit): void => {
    if (fit) setWallpaperFit(fit);
    setWallpaperImage(image);
  };
  const initSession = useCallback(async () => {
    if (await exists(SESSION_FILE)) {
      const sessionData = await readFile(SESSION_FILE);
      const session = JSON.parse(sessionData.toString() || "{}") as SessionData;

      if (session.clockSource) setClockSource(session.clockSource);
      if (session.sortOrders) setSortOrders(session.sortOrders);
      if (session.themeName) setThemeName(session.themeName);
      if (session.wallpaperImage) {
        setWallpaper(session.wallpaperImage, session.wallpaperFit);
      }
      if (session.windowStates) setWindowStates(session.windowStates);
    }

    setSessionLoaded(true);
  }, [exists, readFile]);

  useEffect(() => {
    if (sessionLoaded) {
      writeFile(
        SESSION_FILE,
        JSON.stringify({
          clockSource,
          sortOrders,
          themeName,
          wallpaperFit,
          wallpaperImage,
          windowStates,
        }),
        true
      );
    }
  }, [
    clockSource,
    sessionLoaded,
    sortOrders,
    themeName,
    wallpaperFit,
    wallpaperImage,
    windowStates,
    writeFile,
  ]);
  const setSortOrder = useCallback(
    (
      directory: string,
      order: string[] | ((currentSortOrder: string[]) => string[]),
      sortBy?: SortBy,
      ascending?: boolean
    ): void =>
      setSortOrders((currentSortOrder = {}) => {
        const [currentOrder, currentSortBy, currentAscending] =
          currentSortOrder[directory] || [];
        const newOrder =
          typeof order === "function" ? order(currentOrder) : order;

        return {
          ...currentSortOrder,
          [directory]: [
            newOrder,
            sortBy ?? currentSortBy,
            ascending ?? currentAscending,
          ],
        };
      }),
    []
  );

  useEffect(() => {
    initSession();
  }, [initSession]);

  return {
    clockSource,
    foregroundId,
    prependToStack,
    removeFromStack,
    sessionLoaded,
    setClockSource,
    setForegroundId,
    setSortOrder,
    setThemeName,
    setWallpaper,
    setWindowStates,
    sortOrders,
    stackOrder,
    themeName,
    wallpaperFit,
    wallpaperImage,
    windowStates,
  };
};

export default useSessionContextState;
