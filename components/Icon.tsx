import styles from '../styles/Icon.module.scss';
import { useContext, useState } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import Draggable from 'react-draggable';

type IconType = {
  icon: JSX.Element,
  id: string,
  name: string,
  selectedIconState: [string, Function]
};

// TODO: Change to using a grid that the icons lock into?
export default function Icon({ icon, id, name }: IconType) {
  const { updateApp = () => {} } = useContext(AppsContext),
    [dragging, setDragging] = useState(false),
    openApp = () => updateApp({ id, minimized: false, opened: true });

  return (
    <Draggable
      onDrag={ () => setDragging(true) }
      onStop={ () => setDragging(false) }
    >
      <div
        className={ `${ styles.icon } ${ dragging && styles.dragging }` }
        onDoubleClick={ openApp }
      >
        { icon }
        { name }
      </div>
    </Draggable>
  );
};
