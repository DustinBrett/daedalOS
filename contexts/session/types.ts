import type { Size } from "components/system/Window/RndWindow/useResizable";
import type { Position } from "react-rnd";
import type { ThemeName } from "styles/themes";

export type UpdateFiles = (newFile?: string, oldFile?: string) => void;

export type WindowState = {
  position?: Position;
  size?: Size;
};

export type WindowStates = Record<string, WindowState>;

export type WallpaperFit = "center" | "fill" | "fit" | "stretch" | "tile";

export type SortOrders = Record<string, string[]>;

export type SessionData = {
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
  setForegroundId: React.Dispatch<React.SetStateAction<string>>;
  setSortOrders: React.Dispatch<React.SetStateAction<SortOrders>>;
  setThemeName: React.Dispatch<React.SetStateAction<ThemeName>>;
  setWallpaper: (image: string, fit: WallpaperFit) => void;
  setWindowStates: React.Dispatch<React.SetStateAction<WindowStates>>;
  sortOrders: SortOrders;
  stackOrder: string[];
};
