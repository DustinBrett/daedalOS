import styles from '../styles/Desktop.module.scss';

import { useEffect, useState } from 'react';

type DesktopType = {
  children: Array<JSX.Element>
}

const apiKey = 'a9c415b8dd5516d30782166da51876ed';
const apiUrl = 'https://wall.alphacoders.com/api2.0/get.php';

const bgColor1 = '#e5c4f5';
const bgColor2 = '#3c5ead';

export default function Desktop({ children }: DesktopType) {
  const [background, setBackground] = useState();

  useEffect(() => {
    fetch(`${ apiUrl }?auth=${ apiKey }&method=random&width=${ window.innerWidth }&height=${ window.innerHeight }&operator=min`)
      .then(response => response.json())
      .then(({ wallpapers: [wallpaper] = [] } = {}) => setBackground(wallpaper?.url_image));
  }, []);

  return (
    <div className={ styles.desktop } style={{ backgroundImage:
      `${ background ? `url(${ background }),` : '' } linear-gradient(to top left, ${ bgColor1 }, ${ bgColor2 })` }}
    >
      { children }
    </div>
  );
};
