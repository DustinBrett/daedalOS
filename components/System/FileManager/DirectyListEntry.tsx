import styles from '@/styles/System/FileManager/ListView.module.scss';

import type { DirectyListEntryProps } from '@/types/components/System/FileManager/DirectyListEntry';

import Icon from '@/components/System/Icon';
import { ClickHandler } from '@/utils/events';

const DirectyListEntry: React.FC<DirectyListEntryProps> = ({
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
    className={selected === path ? styles.selected : ''}
    onClick={new ClickHandler({ doubleClick }).clickHandler}
    onFocus={() => setSelected(path)}
    tabIndex={0}
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
            <Icon src={icon} />
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
