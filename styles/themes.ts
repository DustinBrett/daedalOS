import type { Themes } from 'types/styles/themes';
import vantaWaves from 'utils/vantaWaves';

const defaultTheme = {
  colors: {
    backgroundcolor: '#000',
    primary: '#000',
    window: '#808080'
  },
  wallpaper: vantaWaves({
    color: 0x5588,
    shininess: 35,
    waveHeight: 15,
    waveSpeed: 0.3,
    zoom: 0.9
  })
};

const themes: Themes = { defaultTheme };

export default themes;
