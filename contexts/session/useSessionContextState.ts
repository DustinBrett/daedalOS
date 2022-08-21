import type { ApiError } from "browserfs/dist/node/core/api_error";
import type { SortBy } from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import type {
  ClockSource,
  IconPositions,
  SessionContextState,
  SessionData,
  SortOrders,
  WallpaperFit,
  WindowStates,
} from "contexts/session/types";
import { useCallback, useEffect, useState } from "react";
import type { ThemeName } from "styles/themes";
import { DEFAULT_THEME, SESSION_FILE } from "utils/constants";

const useSessionContextState = (): SessionContextState => {
  const { deletePath, exists, readFile, writeFile } = useFileSystem();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [foregroundId, setForegroundId] = useState("");
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);
  const [clockSource, setClockSource] = useState<ClockSource>("local");
  const [windowStates, setWindowStates] = useState<WindowStates>(
    Object.create(null) as WindowStates
  );
  const [sortOrders, setSortOrders] = useState<SortOrders>(
    Object.create(null) as SortOrders
  );
  const [iconPositions, setIconPositions] = useState<IconPositions>({});
  const [wallpaperFit, setWallpaperFit] = useState<WallpaperFit>("fill");
  const [wallpaperImage, setWallpaperImage] = useState("VANTA");
  const [runHistory, setRunHistory] = useState<string[]>([]);
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
  const setWallpaper = useCallback(
    (image: string, fit?: WallpaperFit): void => {
      if (fit) setWallpaperFit(fit);
      setWallpaperImage(image);
    },
    []
  );
  const [haltSession, setHaltSession] = useState(false);

  useEffect(() => {
    if (sessionLoaded && !haltSession) {
      writeFile(
        SESSION_FILE,
        JSON.stringify({
          clockSource,
          iconPositions,
          runHistory,
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
    haltSession,
    iconPositions,
    runHistory,
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
    const initSession = async (): Promise<void> => {
      if (!sessionLoaded && (await exists(SESSION_FILE))) {
        try {
          const sessionData = await readFile(SESSION_FILE);
          const session = JSON.parse(
            sessionData.toString() || "{}"
          ) as SessionData;

          if (session.clockSource) setClockSource(session.clockSource);
          if (session.sortOrders) setSortOrders(session.sortOrders);
          if (session.iconPositions) setIconPositions(session.iconPositions);
          if (session.themeName) setThemeName(session.themeName);
          if (session.wallpaperImage) {
            setWallpaper(session.wallpaperImage, session.wallpaperFit);
          }
          if (session.windowStates) setWindowStates(session.windowStates);
          if (session.runHistory) setRunHistory(session.runHistory);
        } catch (error) {
          if ((error as ApiError)?.code === "ENOENT") deletePath(SESSION_FILE);
        }
      }

      setSessionLoaded(true);
    };

    initSession();
  }, [deletePath, exists, readFile, sessionLoaded, setWallpaper]);

  return {
    clockSource,
    foregroundId,
    iconPositions,
    prependToStack,
    removeFromStack,
    runHistory,
    sessionLoaded,
    setClockSource,
    setForegroundId,
    setHaltSession,
    setIconPositions,
    setRunHistory,
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
