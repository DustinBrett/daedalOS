import { memo, useMemo } from "react";
import {
  type FileManagerViewNames,
  FileEntryIconSize,
} from "components/system/Files/Views";
import Icon from "styles/common/Icon";
import {
  FOLDER_BACK_ICON,
  FOLDER_FRONT_ICON,
  ICON_CACHE,
  SHORTCUT_ICON,
  YT_ICON_CACHE,
} from "utils/constants";

type IconProps = {
  alt: string;
  icon: string;
  view: FileManagerViewNames;
};

type SharedSubIconProps = {
  imgSize?: 64 | 32 | 16 | 8;
  isDesktop?: boolean;
};

type SubIconProps = SharedSubIconProps &
  IconProps & {
    baseIcon: string;
    isFirstImage: boolean;
    totalSubIcons: number;
  };

type SubIconsProps = SharedSubIconProps &
  IconProps & {
    showShortcutIcon: boolean;
    subIcons?: string[];
  };

const WIDE_IMAGE_TRANSFORM = "matrix(0.5, 0.05, 0, 0.7, 2, 1)";
const WIDE_IMAGE_TRANSFORM_16 = "matrix(0.5, 0.05, 0, 0.8, 3.5, 2)";
const SHORT_IMAGE_TRANSFORM = "matrix(0.4, 0.14, 0, 0.7, -4, 2)";
const SHORT_IMAGE_TRANSFORM_16 = "matrix(0.4, 0.14, 0, 0.8, -0.5, 2)";

const SubIcon: FC<SubIconProps> = ({
  baseIcon,
  icon,
  imgSize,
  isDesktop,
  isFirstImage,
  alt,
  totalSubIcons,
  view,
}) => {
  const iconView = useMemo(() => {
    const isSub =
      ![SHORTCUT_ICON, FOLDER_FRONT_ICON].includes(icon) &&
      !icon.startsWith("blob:") &&
      !icon.startsWith(ICON_CACHE) &&
      !icon.startsWith(YT_ICON_CACHE);

    if (icon === SHORTCUT_ICON && view === "details") {
      return {
        displaySize: 16,
        imgSize: 48,
      };
    }

    return FileEntryIconSize[
      isSub ? (view === "details" ? "detailsSub" : "sub") : view
    ];
  }, [icon, view]);

  const style = useMemo((): React.CSSProperties | undefined => {
    if (icon === FOLDER_FRONT_ICON) return { zIndex: 3 };

    if (baseIcon === FOLDER_BACK_ICON) {
      const hasMultipleSubIcons = totalSubIcons - 1 > 1;
      const isSmallImage = imgSize === 16;
      const shortTransform = isSmallImage
        ? SHORT_IMAGE_TRANSFORM_16
        : SHORT_IMAGE_TRANSFORM;
      const wideTransform = isSmallImage
        ? WIDE_IMAGE_TRANSFORM_16
        : WIDE_IMAGE_TRANSFORM;
      const transform = isFirstImage
        ? hasMultipleSubIcons
          ? shortTransform
          : wideTransform
        : wideTransform;

      return {
        objectFit: "cover",
        transform: `${transform} translateZ(0px)`,
        zIndex: isFirstImage ? 2 : 1,
      };
    }

    return undefined;
  }, [baseIcon, icon, imgSize, isFirstImage, totalSubIcons]);

  return (
    <Icon
      $eager={isDesktop || icon === SHORTCUT_ICON}
      alt={alt}
      src={icon}
      style={style}
      {...iconView}
    />
  );
};

const MemoizedSubIcon = memo(SubIcon);

const SubIcons: FC<SubIconsProps> = ({
  alt,
  icon,
  imgSize,
  isDesktop,
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
  const filteredSubIcons = useMemo(() => {
    const iconsLength = icons?.length;

    if (
      iconsLength &&
      view === "details" &&
      icons[iconsLength - 1] === FOLDER_FRONT_ICON
    ) {
      return [];
    }

    return icons?.filter((subIcon) => subIcon !== icon) || [];
  }, [icon, icons, view]);

  return (
    <>
      {filteredSubIcons.map((entryIcon, subIconIndex) => (
        <MemoizedSubIcon
          key={entryIcon}
          alt={alt}
          baseIcon={icon}
          icon={entryIcon}
          imgSize={imgSize}
          isDesktop={isDesktop}
          isFirstImage={subIconIndex === 0}
          totalSubIcons={filteredSubIcons.length}
          view={view}
        />
      ))}
    </>
  );
};

export default memo(SubIcons);
