import type { DefaultTheme } from 'styled-components';
import defaultTheme from 'styles/defaultTheme';

type Themes = {
  [key: string]: DefaultTheme;
};

const themes: Themes = { defaultTheme };

export default themes;
