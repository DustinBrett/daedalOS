import { useState } from 'react';
import Draggable from 'react-draggable';

import styles from '../styles/Icon.module.scss';

type IconType = {
  icon: JSX.Element,
  name: string
};

export default function Icon({ icon, name }: IconType) {
  const [dragging, setDragging] = useState(false);

  return (
    <Draggable
      onStart={ () => setDragging(true) }
      onStop={ () => setDragging(false) }
    >
      <div className={ `${ styles.icon } ${ dragging && styles.dragging }` } >
        { icon }
        { name }
      </div>
    </Draggable>
  );
};
