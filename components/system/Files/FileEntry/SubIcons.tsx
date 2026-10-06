import {
  FileEntryIconSize,
  type FileManagerViewNames,
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
  imgSize?: 16 | 32 | 64 | 8;
  isDesktop?: boolean;
};

type SubIconProps = SharedSubIconProps &
  IconProps & {
    baseIcon: string;
    isFirstImage: boolean;
    isHidden: boolean;
    totalSubIcons: number;
  };

type SubIconsProps = SharedSubIconProps &
  IconProps & {
    loadedIcon?: string;
    showShortcutIcon: boolean;
    subIcons?: string[];
  };

const WIDE_IMAGE_TRANSFORM = "matrix(0.5, 0.05, 0, 0.7, 2, 1)";
const WIDE_IMAGE_TRANSFORM_16 = "matrix(0.5, 0.05, 0, 0.8, 3.5, 2)";
const SHORT_IMAGE_TRANSFORM = "matrix(0.4, 0.14, 0, 0.7, -4, 2)";
const SHORT_IMAGE_TRANSFORM_16 = "matrix(0.4, 0.14, 0, 0.8, -0.5, 2)";

const NON_SUB_ICONS = new Set([SHORTCUT_ICON, FOLDER_FRONT_ICON]);

const getBaseStyle = (
  baseIcon: string,
  icon: string,
  imgSize: SharedSubIconProps["imgSize"],
  isFirstImage: boolean,
  totalSubIcons: number
): React.CSSProperties | undefined => {
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
};

const getIconView = (
  icon: string,
  view: FileManagerViewNames
): (typeof FileEntryIconSize)[keyof typeof FileEntryIconSize] => {
  const isSub =
    !NON_SUB_ICONS.has(icon) &&
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
};

const SubIcon: FC<SubIconProps> = ({
  alt,
  baseIcon,
  icon,
  imgSize,
  isDesktop,
  isFirstImage,
  isHidden,
  totalSubIcons,
  view,
}) => {
  const iconView = getIconView(icon, view);
  const baseStyle = getBaseStyle(
    baseIcon,
    icon,
    imgSize,
    isFirstImage,
    totalSubIcons
  );
  const style = isHidden
    ? { ...baseStyle, visibility: "hidden" as const }
    : baseStyle;

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

const SubIcons: FC<SubIconsProps> = ({
  alt,
  icon,
  imgSize,
  isDesktop,
  loadedIcon = icon,
  showShortcutIcon,
  subIcons,
  view,
}) => {
  const icons = showShortcutIcon
    ? subIcons?.filter((iconEntry) => iconEntry !== SHORTCUT_ICON)
    : subIcons;
  const iconsLength = icons?.length;
  const filteredSubIcons =
    iconsLength &&
    view === "details" &&
    icons[iconsLength - 1] === FOLDER_FRONT_ICON
      ? []
      : icons || [];

  return (
    <>
      {filteredSubIcons.map((entryIcon, subIconIndex) => (
        <SubIcon
          key={entryIcon}
          alt={alt}
          baseIcon={icon}
          icon={entryIcon}
          imgSize={imgSize}
          isDesktop={isDesktop}
          isFirstImage={subIconIndex === 0}
          // Stay mounted to preload, but wait until the main icon has swapped
          isHidden={
            !loadedIcon || entryIcon === icon || entryIcon === loadedIcon
          }
          totalSubIcons={filteredSubIcons.length}
          view={view}
        />
      ))}
    </>
  );
};

export default SubIcons;
