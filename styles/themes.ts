import type { DefaultTheme } from "styled-components";
import kumavisTheme from "styles/kumavisTheme";

const themes = { defaultTheme: kumavisTheme };

export type ThemeName = keyof typeof themes;

export default themes as Record<ThemeName, DefaultTheme>;
