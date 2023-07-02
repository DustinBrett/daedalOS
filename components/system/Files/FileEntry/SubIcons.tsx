import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileEntryIconSize } from "components/system/Files/Views";
import { memo, useMemo } from "react";
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
  isFirstImage: boolean;
  totalSubIcons: number;
};

type SubIconsProps = IconProps & {
  showShortcutIcon: boolean;
  subIcons?: string[];
};

const WIDE_IMAGE_TRANSFORM = "matrix(0.5, 0.05, 0, 0.7, 2, 1)";
const SHORT_IMAGE_TRANSFORM = "matrix(0.4, 0.14, 0, 0.7, -4, 2)";

const SubIcon: FC<SubIconProps> = ({
  baseIcon,
  icon,
  isFirstImage,
  name,
  totalSubIcons,
  view,
}) => {
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
  const style = useMemo((): React.CSSProperties | undefined => {
    if (icon === FOLDER_FRONT_ICON) return { zIndex: 3 };

    if (baseIcon === FOLDER_BACK_ICON) {
      const hasMultipleSubIcons = totalSubIcons - 1 > 1;
      const transform = isFirstImage
        ? hasMultipleSubIcons
          ? SHORT_IMAGE_TRANSFORM
          : WIDE_IMAGE_TRANSFORM
        : WIDE_IMAGE_TRANSFORM;

      return {
        objectFit: "cover",
        transform: `${transform} translateZ(0px)`,
        zIndex: isFirstImage ? 2 : 1,
      };
    }

    return undefined;
  }, [baseIcon, icon, isFirstImage, totalSubIcons]);

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

const MemoizedSubIcon = memo(SubIcon);

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
        <MemoizedSubIcon
          key={entryIcon}
          baseIcon={icon}
          icon={entryIcon}
          isFirstImage={subIconIndex === 0}
          name={name}
          totalSubIcons={filteredSubIcons.length}
          view={view}
        />
      ))}
    </>
  );
};

export default memo(SubIcons);
