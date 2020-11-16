import styles from '@/styles/System/FileManager/IconsView.module.scss';

import type { IconEntryProps } from '@/types/components/System/FileManager/IconEntry';

import Icon from '@/components/System/Icon';
import { ClickHandler } from '@/utils/events';
import {
  desktopIconDragSettings,
  desktopIconMotionSettings
} from '@/utils/motions';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

const DirectyIconEntry: React.FC<IconEntryProps> = ({
  icon,
  name,
  kind,
  path,
  url,
  navRef,
  onDoubleClick
}) => {
  const [initialPosition, setInitialPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLLIElement>(null);
  const getPosition = () => {
    const { top = 0, left = 0 } =
      iconRef?.current?.getBoundingClientRect() || {};
    const { top: initialTop = 0, left: initialLeft = 0 } =
      initialPosition || {};

    return {
      top: top - initialTop,
      left: left - initialLeft
    };
  };

  return (
    <motion.li
      drag
      layout
      dragConstraints={navRef}
      className={styles.directoryIcon}
      onClick={
        new ClickHandler({
          doubleClick: onDoubleClick({ path, url, icon, name })
        }).clickHandler
      }
      onDragStart={() => !initialPosition && setInitialPosition(getPosition())}
      onDragEnd={() => setPosition(getPosition())}
      ref={iconRef}
      tabIndex={-1}
      title={`${name}${kind ? `\r\nType: ${kind}` : ''}`}
      style={position}
      {...desktopIconDragSettings}
      {...desktopIconMotionSettings}
    >
      <figure>
        <Icon src={icon} height={42} width={42} />
        <figcaption>{name}</figcaption>
      </figure>
    </motion.li>
  );
};

export default DirectyIconEntry;
