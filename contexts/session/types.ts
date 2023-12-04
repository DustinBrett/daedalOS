import { type Position } from "react-rnd";
import { type SortBy } from "components/system/Files/FileManager/useSortBy";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { type ThemeName } from "styles/themes";

declare global {
  interface Window {
    sessionIsWriteable: boolean;
  }
}

export type UpdateFiles = (newFile?: string, oldFile?: string) => void;

export type WindowState = {
  maximized?: boolean;
  position?: Position;
  size?: Size;
};

export type WindowStates = Record<string, WindowState>;

export type WallpaperFit = "center" | "fill" | "fit" | "stretch" | "tile";

type SortOrder = [string[], SortBy?, boolean?];

export type SortOrders = Record<string, SortOrder>;

export type ClockSource = "local" | "ntp";

export type RecentFiles = [string, string, string][];

export type IconPosition = {
  gridColumnStart: number;
  gridRowStart: number;
};

export type IconPositions = Record<string, IconPosition>;

export type SessionData = {
  clockSource: ClockSource;
  cursor: string;
  iconPositions: IconPositions;
  recentFiles: RecentFiles;
  runHistory: string[];
  sortOrders: SortOrders;
  themeName: ThemeName;
  wallpaperFit: WallpaperFit;
  wallpaperImage: string;
  windowStates: WindowStates;
};

export type SessionContextState = SessionData & {
  foregroundId: string;
  prependToStack: (id: string) => void;
  removeFromStack: (id: string) => void;
  sessionLoaded: boolean;
  setClockSource: React.Dispatch<React.SetStateAction<ClockSource>>;
  setCursor: React.Dispatch<React.SetStateAction<string>>;
  setForegroundId: React.Dispatch<React.SetStateAction<string>>;
  setHaltSession: React.Dispatch<React.SetStateAction<boolean>>;
  setIconPositions: React.Dispatch<React.SetStateAction<IconPositions>>;
  setRunHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setSortOrder: (
    directory: string,
    order: string[] | ((currentSortOrder: string[]) => string[]),
    sortBy?: SortBy,
    ascending?: boolean
  ) => void;
  setThemeName: React.Dispatch<React.SetStateAction<ThemeName>>;
  setWallpaper: (image: string, fit?: WallpaperFit) => void;
  setWindowStates: React.Dispatch<React.SetStateAction<WindowStates>>;
  stackOrder: string[];
  updateRecentFiles: (url: string, pid: string, title?: string) => void;
};
