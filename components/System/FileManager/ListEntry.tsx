import styles from '@/styles/System/FileManager/ListView.module.scss';

import type { ListEntryProps } from '@/types/components/System/FileManager/ListEntry';

import Icon from '@/components/System/Icon';
import { ClickHandler } from '@/utils/events';

const DirectyListEntry: React.FC<ListEntryProps> = ({
  path = '..',
  name,
  icon = '',
  fullName,
  size,
  kind,
  selected,
  setSelected,
  doubleClick
}) => (
  <tr
    className={selected === path ? `${styles.selected} selected` : ''}
    onClick={new ClickHandler({ doubleClick }).clickHandler}
    onFocus={() => setSelected(path)}
    tabIndex={-1}
  >
    {path === '..' ? (
      <>
        <td>..</td>
        <td colSpan={2} />
      </>
    ) : (
      <>
        <td className={styles.emphasis} title={name}>
          <figure>
            <Icon src={icon} height={16} width={16} />
            <figcaption title={name}>{fullName}</figcaption>
          </figure>
        </td>
        <td className={styles.alignRight}>{size}</td>
        <td>{kind}</td>
      </>
    )}
  </tr>
);

export default DirectyListEntry;
