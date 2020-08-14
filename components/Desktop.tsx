import styles from '../styles/Desktop.module.scss';

import { useEffect, useState } from 'react';

type DesktopType = {
  children: Array<JSX.Element>
}

const bgColor1 = '#e5c4f5';
const bgColor2 = '#3c5ead';

export default function Desktop({ children }: DesktopType) {
  const [background, setBackground] = useState(`linear-gradient(to top left, ${ bgColor1 }, ${ bgColor2 })`);

  useEffect(() => {
    const { innerHeight: h, innerWidth: w } = window;

    setBackground(
      `url(https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?crop=entropy&fit=crop&h=${ h }&w=${ w })`
    )
  }, []);

  return (
    <div className={ styles.desktop } style={{ backgroundImage: background }}>
      { children }
    </div>
  );
};
