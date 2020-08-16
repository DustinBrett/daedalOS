import styles from '../styles/Icon.module.scss';
import { useContext, useState } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import Draggable from 'react-draggable'; // TODO: Use posed for this or RnD

type IconType = {
  icon: JSX.Element,
  id: string,
  name: string,
  selectedIconState: [string, Function]
};

// TODO: Change to using a grid that the icons lock into?
export default function Icon({ icon, id, name, selectedIconState: [selectedIcon, setSelectedIcon] }: IconType) {
  const { updateApp = () => {} } = useContext(AppsContext),
    [dragging, setDragging] = useState(false),
    selectIcon = () => setSelectedIcon(id), // TODO: On pressing enter | arrows to navigate icons
    openApp = () => (updateApp as Function)({ id, minimized: false, opened: true });

  return (
    <Draggable
      onDrag={ () => setDragging(true) }
      onStop={ () => setDragging(false) }
    >
      <div
        className={ `${ styles.icon } ${ dragging && styles.dragging } ${ selectedIcon === id && styles.selected }` }
        onClick={ selectIcon }
        onDoubleClick={ openApp }
      >
        { icon }
        { name }
      </div>
    </Draggable>
  );
};
