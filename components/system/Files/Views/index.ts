import StyledIconFileEntry from "components/system/Files/Views/Icon/StyledFileEntry";
import StyledIconFileManager from "components/system/Files/Views/Icon/StyledFileManager";
import StyledListFileEntry from "components/system/Files/Views/List/StyledFileEntry";
import StyledListFileManager from "components/system/Files/Views/List/StyledFileManager";
import type { DefaultTheme, StyledComponent } from "styled-components";
import type { IconProps } from "styles/common/Icon";

export type StyledFileEntryProps = {
  $visible?: boolean;
};

export type StyledFileManagerProps = {
  $scrollable: boolean;
  $selecting?: boolean;
};

type FileManagerView = {
  StyledFileEntry: StyledComponent<"li", DefaultTheme, StyledFileEntryProps>;
  StyledFileManager: StyledComponent<
    "ol",
    DefaultTheme,
    StyledFileManagerProps
  >;
};

export type FileManagerViewNames = "icon" | "list";

export const FileManagerViews: Record<FileManagerViewNames, FileManagerView> = {
  icon: {
    StyledFileEntry: StyledIconFileEntry,
    StyledFileManager: StyledIconFileManager,
  },
  list: {
    StyledFileEntry: StyledListFileEntry,
    StyledFileManager: StyledListFileManager,
  },
};

export const FileEntryIconSize: Record<
  FileManagerViewNames | "sub",
  IconProps
> = {
  icon: {
    imgSize: 48,
  },
  list: {
    displaySize: 24,
    imgSize: 48,
  },
  sub: {
    displaySize: 48,
    imgSize: 16,
  },
};
