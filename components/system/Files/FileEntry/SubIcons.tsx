import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileEntryIconSize } from "components/system/Files/Views";
import { useMemo } from "react";
import Icon from "styles/common/Icon";
import {
  FOLDER_BACK_ICON,
  FOLDER_FRONT_ICON,
  SHORTCUT_ICON,
} from "utils/constants";

type IconProps = {
  icon: string;
  name: string;
  view: FileManagerViewNames;
};

type SubIconProps = IconProps & {
  baseIcon: string;
  index: number;
};

type SubIconsProps = IconProps & {
  showShortcutIcon: boolean;
  subIcons?: string[];
};

const SubIcon: FC<SubIconProps> = ({ baseIcon, icon, index, name, view }) => {
  const iconView = useMemo(
    () =>
      FileEntryIconSize[
        ![SHORTCUT_ICON, FOLDER_FRONT_ICON].includes(icon) &&
        !icon.startsWith("blob:")
          ? "sub"
          : view
      ],
    [icon, view]
  );
  const style = useMemo(
    () =>
      baseIcon === FOLDER_BACK_ICON && icon !== FOLDER_FRONT_ICON
        ? {
            transform: `${
              index === 0
                ? "matrix(0, 1.8, 1.8, 0.2, 1.2, 2)"
                : "matrix(0, 1.8, 1.2, 0.4, -4, 4)"
            } scaleX(-1) scale(0.4) translateZ(0px)`,
          }
        : undefined,
    [baseIcon, icon, index]
  );

  return (
    <Icon
      $eager={icon === SHORTCUT_ICON}
      alt={name}
      src={icon}
      style={style}
      {...iconView}
    />
  );
};

const SubIcons: FC<SubIconsProps> = ({
  icon,
  name,
  showShortcutIcon,
  subIcons,
  view,
}) => {
  const icons = useMemo(
    () =>
      showShortcutIcon
        ? subIcons?.filter((iconEntry) => iconEntry !== SHORTCUT_ICON)
        : subIcons,
    [showShortcutIcon, subIcons]
  );
  const filteredSubIcons = useMemo(
    () => icons?.filter((subIcon) => subIcon !== icon) || [],
    [icon, icons]
  );

  return (
    <>
      {filteredSubIcons.map((entryIcon, subIconIndex) => (
        <SubIcon
          key={entryIcon}
          baseIcon={icon}
          icon={entryIcon}
          index={subIconIndex}
          name={name}
          view={view}
        />
      ))}
    </>
  );
};

export default SubIcons;
