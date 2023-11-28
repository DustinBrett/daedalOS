import { type DefaultTheme } from "styled-components";
import defaultTheme from "styles/defaultTheme";

const themes = { defaultTheme };

export type ThemeName = keyof typeof themes;

export default themes as Record<ThemeName, DefaultTheme>;
