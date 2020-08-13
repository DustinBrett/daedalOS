import styles from '../styles/Desktop.module.scss';

import { useEffect, useState } from 'react';
import { url } from 'inspector';

type DesktopType = {
  children: Array<JSX.Element>
}

const apiKey = 'a9c415b8dd5516d30782166da51876ed';
const apiUrl = 'https://wall.alphacoders.com/api2.0/get.php';

export default function Desktop({ children }: DesktopType) {
  const [background, setBackground] = useState();

  useEffect(() => {
    fetch(`${ apiUrl }?auth=${ apiKey }&method=random&width=${ window.innerWidth }&height=${ window.innerHeight }&operator=min`)
      .then(response => response.json())
      .then(({ wallpapers: [wallpaper] = [] } = {}) => setBackground(wallpaper?.url_image));
  }, []);

  return (
    <div className={ styles.desktop } style={{ backgroundImage: `url(${ background })` }}>
      { children }
    </div>
  );
};
