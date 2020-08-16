import styles from '../styles/Wallpaper.module.scss';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import WAVES from '../assets/lib/vanta.waves.min';

// TODO: Change color like rainbow effect? Can be changed dynamic on demo site.

export default function Wallpaper() {
  const [vantaEffect, setVantaEffect] = useState(), // TODO: Type
    vantaRef = useRef(),
    vantaSettings = {
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      color: 0x101f34,
      shininess: 15,
      waveHeight: 25,
      waveSpeed: 0.5,
      zoom: 0.9
    };

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(WAVES({
        el: vantaRef.current,
        THREE: THREE,
        ...vantaSettings
      }));
    }
  }, []);

  return (
    <div className={ styles.wallpaper } ref={ vantaRef }/>
  );
};
