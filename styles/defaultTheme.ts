import vantaWaves from 'utils/vantaWaves';

const colors = {
  background: '#000',
  primary: '#000',
  window: '#808080'
};

const wallpaper = vantaWaves({
  color: 0x5588,
  shininess: 35,
  waveHeight: 15,
  waveSpeed: 0.3,
  zoom: 0.9
});

const defaultTheme = { colors, wallpaper };

export default defaultTheme;
