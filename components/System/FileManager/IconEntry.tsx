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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLLIElement>(null);

  return (
    <motion.li
      key={path}
      drag
      layout
      dragConstraints={navRef}
      onClick={
        new ClickHandler({
          doubleClick: onDoubleClick({ path, url, icon, name })
        }).clickHandler
      }
      onDragEnd={() => {
        const { top = 0, left = 0 } =
          iconRef?.current?.getBoundingClientRect() || {};

        setPosition({ top, left });
      }}
      ref={iconRef}
      tabIndex={-1}
      title={`${name}${kind ? `\r\nType: ${kind}` : ''}`}
      style={{
        position:
          position.top !== 0 || position.left !== 0 ? 'fixed' : 'relative',
        ...position
      }}
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
