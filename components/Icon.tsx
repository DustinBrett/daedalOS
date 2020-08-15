import styles from '../styles/Icon.module.scss';
import { useState } from 'react';
import Draggable from 'react-draggable'; // TODO: Change me

type IconType = {
  icon: JSX.Element,
  name: string
};

// TODO: Selected/active styling
// todo: No more react-draggable
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
