import styles from '../styles/Icon.module.scss';
import { useContext, useState } from 'react';
import { useDoubleTap } from 'use-double-tap';
import { AppsContext } from '../resources/AppsProvider';
import { motion } from 'framer-motion';

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

  // TODO: Fix z-index for icons when dragging over window
    // TODO: Add drag effects
  return (
    <motion.div
      drag
      // TODO: Get this working so the 2nd row icon also is locked to top of screen
        // Can I use vh?
      // dragConstraints={desktopRef}
      dragMomentum={ false }
      onDrag={ () => setDragging(true) }
      onDragEnd={ () => setDragging(false) }
    >
      <div
        className={ `${ styles.icon } ${ dragging && styles.dragging } ${ selectedIcon === id && styles.selected }` }
        onClick={ selectIcon }
        onDoubleClick={ openApp }
        {...useDoubleTap(openApp) }
      >
        { icon }
        { name }
      </div>
    </motion.div>
  );
};
