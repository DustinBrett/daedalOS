import styles from '../styles/Desktop.module.scss';

import { useEffect, useState } from 'react';

type DesktopType = {
  children: Array<JSX.Element>
}

const bgColor1 = '#e5c4f5';
const bgColor2 = '#3c5ead';

const wallpapers = [
  'https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg?crop=entropy&fit=crop&fm=jpg&h=$h&w=$w',
  'https://images.pexels.com/photos/1903702/pexels-photo-1903702.jpeg?crop=entropy&fit=crop&fm=jpg&h=$h&w=$w',
  'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg?crop=entropy&fit=crop&fm=jpg&h=$h&w=$w',
  'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?crop=entropy&fit=crop&fm=jpg&h=$h&w=$w',
  'https://images.pexels.com/photos/909/flowers-garden-colorful-colourful.jpg?crop=entropy&fit=crop&fm=jpg&h=$h&w=$w'
];

const randomWallpaper = () => {
  const { innerHeight: h, innerWidth: w } = window;

  return wallpapers[Math.round(Math.random() * (wallpapers.length - 1))]
    .replace('$h', h.toString())
    .replace('$w', w.toString());
}

export default function Desktop({ children }: DesktopType) {
  const [background, setBackground] = useState(`linear-gradient(to top left, ${ bgColor1 }, ${ bgColor2 })`);

  useEffect(() => setBackground(`url(${ randomWallpaper() })`), []);

  return (
    <div className={ styles.desktop } style={{ backgroundImage: background }}>
      { children }
    </div>
  );
};
