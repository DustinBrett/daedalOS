import { useFileSystem } from "contexts/fileSystem";
import type {
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
  const { fs } = useFileSystem();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [foregroundId, setForegroundId] = useState("");
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);
  const [windowStates, setWindowStates] = useState<WindowStates>({});
  const [sortOrders, setSortOrders] = useState<SortOrders>({});
  const [wallpaperFit, setWallpaperFit] = useState<WallpaperFit>("fill");
  const [wallpaperImage, setWallpaperImage] = useState("");
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
  const setWallpaper = (image: string, fit: WallpaperFit): void => {
    setWallpaperFit(fit);
    setWallpaperImage(image);
  };

  useEffect(() => {
    if (sessionLoaded) {
      fs?.writeFile(
        SESSION_FILE,
        JSON.stringify({
          sortOrders,
          themeName,
          wallpaperFit,
          wallpaperImage,
          windowStates,
        })
      );
    }
  }, [
    fs,
    sessionLoaded,
    sortOrders,
    themeName,
    wallpaperFit,
    wallpaperImage,
    windowStates,
  ]);

  useEffect(
    () =>
      fs?.readFile(SESSION_FILE, (_error, contents) => {
        if (contents) {
          const session = JSON.parse(
            contents.toString() || "{}"
          ) as SessionData;

          setSortOrders(session.sortOrders);
          setThemeName(session.themeName);
          setWallpaper(session.wallpaperImage, session.wallpaperFit);
          setWindowStates(session.windowStates);
        }

        setSessionLoaded(true);
      }),
    [fs]
  );

  return {
    foregroundId,
    prependToStack,
    removeFromStack,
    sessionLoaded,
    setForegroundId,
    setSortOrders,
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
