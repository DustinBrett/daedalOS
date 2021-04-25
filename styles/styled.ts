import 'styled-components';

export type WallpaperEffect = (element: HTMLElement | null) => () => void;

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      fileEntry: {
        background: string;
        border: string;
        text: string;
        textShadow: string;
      };
      highlight: string;
      startButton: string;
      taskbar: {
        active: string;
        activeHover: string;
        background: string;
        hover: string;
      };
      text: string;
      titleBar: {
        background: string;
        backgroundHover: string;
        backgroundInactive: string;
        buttonInactive: string;
        closeHover: string;
        text: string;
        textInactive: string;
      };
      window: {
        background: string;
        outline: string;
        outlineInactive: string;
        shadow: string;
        shadowInactive: string;
      };
    };
    formats: {
      date: Intl.DateTimeFormatOptions;
      time: Intl.DateTimeFormatOptions;
    };
    sizes: {
      clock: {
        fontSize: string;
        width: string;
      };
      fileEntry: {
        fontSize: string;
        iconSize: string;
        letterSpacing: string;
      };
      fileManager: {
        columnGap: string;
        gridEntryHeight: string;
        gridEntryWidth: string;
        padding: string;
        rowGap: string;
      };
      startButton: {
        iconSize: string;
        width: string;
      };
      taskbar: {
        blur: string;
        entry: {
          borderSize: string;
          fontSize: string;
          icon: {
            size: string;
          };
          maxWidth: string;
        };
        height: string;
      };
      titleBar: {
        buttonIconWidth: string;
        buttonWidth: string;
        fontSize: string;
        height: string;
        iconMargin: string;
        iconSize: string;
      };
      window: {
        lineHeight: string;
        outline: string;
      };
    };
    wallpaper?: WallpaperEffect;
  }
}
