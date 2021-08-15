import type { Size } from "components/system/Window/RndWindow/useResizable";
import type { Position } from "react-rnd";

export type WindowState = {
  position?: Position;
  size?: Size;
};

export type WindowStates = {
  [id: string]: WindowState;
};

export type WallpaperFit = "fill" | "fit" | "stretch" | "tile" | "center";

export type SessionContextState = {
  blurEntry: (entry?: string) => void;
  focusEntry: (entry: string) => void;
  focusedEntries: string[];
  foregroundId: string;
  prependToStack: (id: string) => void;
  removeFromStack: (id: string) => void;
  sessionLoaded: boolean;
  setForegroundId: React.Dispatch<React.SetStateAction<string>>;
  setThemeName: React.Dispatch<React.SetStateAction<string>>;
  setWallpaper: (image: string, fit: WallpaperFit) => void;
  setWindowStates: React.Dispatch<React.SetStateAction<WindowStates>>;
  stackOrder: string[];
  startMenuVisible: boolean;
  themeName: string;
  toggleStartMenu: (showMenu?: boolean) => void;
  wallpaperFit: WallpaperFit;
  wallpaperImage: string;
  windowStates: WindowStates;
};
