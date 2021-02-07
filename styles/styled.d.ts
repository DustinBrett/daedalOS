import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      backgroundcolor: string;
      primary: string;
      window: string;
    };
    wallpaper: WallpaperEffect;
  }
}
