import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileEntryIconSize } from "components/system/Files/Views";
import { useMemo, useState } from "react";
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

const WIDE_IMAGE_TRANSFORM = "matrix(0.5, 0.07, 0, 0.7, 2, 2)";
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
  const [aspectRatio, setAspectRatio] = useState(0);
  const style = useMemo((): React.CSSProperties | undefined => {
    if (icon === FOLDER_FRONT_ICON) return { zIndex: 3 };

    if (baseIcon === FOLDER_BACK_ICON) {
      const hasMultipleSubIcons = totalSubIcons - 1 > 1;

      let transform: string;

      if (isFirstImage) {
        transform = hasMultipleSubIcons
          ? SHORT_IMAGE_TRANSFORM
          : WIDE_IMAGE_TRANSFORM;
      } else {
        transform = WIDE_IMAGE_TRANSFORM;
      }

      return {
        transform: `${transform} translateZ(0px)${
          aspectRatio > 1.5 ? " rotate(90deg) scaleY(2)" : ""
        }`,
        zIndex: isFirstImage ? 2 : 1,
      };
    }

    return undefined;
  }, [aspectRatio, baseIcon, icon, isFirstImage, totalSubIcons]);

  return (
    <Icon
      ref={(iconRef) => {
        if (iconRef && icon.startsWith("blob:")) {
          iconRef.addEventListener("load", () => {
            if (iconRef.naturalWidth && iconRef.naturalHeight) {
              setAspectRatio(iconRef.naturalWidth / iconRef.naturalHeight);
            }
          });
        }
      }}
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
          isFirstImage={subIconIndex === 0}
          name={name}
          totalSubIcons={filteredSubIcons.length}
          view={view}
        />
      ))}
    </>
  );
};

export default SubIcons;
