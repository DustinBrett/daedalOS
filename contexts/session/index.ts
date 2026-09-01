import contextActionSelectorFactory from "contexts/contextActionSelectorFactory";
import {
  type SessionContextState,
  type SortOrder,
  type WindowState,
} from "contexts/session/types";
import useSessionContextState from "contexts/session/useSessionContextState";

const { Provider, useContextActions, useStateSelector } =
  contextActionSelectorFactory(useSessionContextState);

const NO_SORT_ORDER: Partial<SortOrder> = [];
const NO_WINDOW_STATE = Object.create(null) as WindowState;

export const useAiEnabled = (): boolean =>
  useStateSelector((state) => state.aiEnabled);

export const useClockSource = (): SessionContextState["clockSource"] =>
  useStateSelector((state) => state.clockSource);

export const useCloseEffect = (): string =>
  useStateSelector((state) => state.closeEffect);

export const useCursorUrl = (): string | undefined =>
  useStateSelector((state) => state.cursor);

export const useForegroundId = (): string =>
  useStateSelector((state) => state.foregroundId);

export const useIconPositions = (): SessionContextState["iconPositions"] =>
  useStateSelector((state) => state.iconPositions);

export const useRecentFiles = (): SessionContextState["recentFiles"] =>
  useStateSelector((state) => state.recentFiles);

export const useRunHistory = (): string[] =>
  useStateSelector((state) => state.runHistory);

export const useSessionLoaded = (): boolean =>
  useStateSelector((state) => state.sessionLoaded);

export const useSortOrder = (directory: string): Partial<SortOrder> =>
  useStateSelector((state) => state.sortOrders[directory] || NO_SORT_ORDER);

export const useStackOrder = (): string[] =>
  useStateSelector((state) => state.stackOrder);

export const useThemeName = (): SessionContextState["themeName"] =>
  useStateSelector((state) => state.themeName);

export const useView = (
  directory: string
): SessionContextState["views"][string] | undefined =>
  useStateSelector((state) => state.views[directory]);

export const useWallpaperFit = (): SessionContextState["wallpaperFit"] =>
  useStateSelector((state) => state.wallpaperFit);

export const useWallpaperImage = (): string =>
  useStateSelector((state) => state.wallpaperImage);

export const useWindowState = (id: string): WindowState =>
  useStateSelector((state) => state.windowStates[id] || NO_WINDOW_STATE);

export { Provider as SessionProvider, useContextActions as useSessionActions };
