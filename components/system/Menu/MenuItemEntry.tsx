import type { MenuItem } from 'contexts/menu/useMenuContextState';
import Icon from 'styles/common/Icon';

type MenuItemEntryProps = MenuItem & {
  resetMenu: () => void;
};

const MenuItemEntry = ({
  action,
  icon,
  label,
  primary,
  resetMenu,
  separator
}: MenuItemEntryProps): JSX.Element => (
  <li>
    {separator ? (
      <hr />
    ) : (
      <figure
        onClick={() => {
          action?.();
          resetMenu();
        }}
      >
        {icon && <Icon src={icon} alt={label} size={16} />}
        <figcaption className={primary ? 'primary' : ''}>{label}</figcaption>
      </figure>
    )}
  </li>
);

export default MenuItemEntry;
