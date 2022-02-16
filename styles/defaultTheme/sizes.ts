import { TASKBAR_HEIGHT } from "utils/constants";

const sizes = {
  clock: {
    fontSize: "12px",
    width: "76px",
  },
  contextMenu: {
    subMenuOffset: 3,
  },
  fileEntry: {
    fontSize: "12px",
    iconSize: "48px",
    maxIconTextDisplayWidth: 68,
    maxListTextDisplayWidth: 102,
    renamePadding: 5,
    renameWidth: 75,
  },
  fileExplorer: {
    navBarHeight: "42px",
    statusBarHeight: "23px",
  },
  fileManager: {
    columnGap: "1px",
    gridEntryHeight: "70px",
    gridEntryWidth: "74px",
    padding: "5px 0",
    rowGap: "28px",
  },
  startButton: {
    iconSize: "15px",
    width: "36px",
  },
  startMenu: {
    sideBar: {
      expandedWidth: "220px",
      height: "48px",
      iconSize: "16px",
      width: "48px",
    },
    size: "320px",
  },
  taskbar: {
    blur: "5px",
    entry: {
      borderSize: "2px",
      fontSize: "12px",
      iconSize: "16px",
      maxWidth: "160px",
      peekImage: {
        height: "82px",
        margin: "8px",
      },
    },
    height: `${TASKBAR_HEIGHT}px`,
  },
  titleBar: {
    buttonIconWidth: "10px",
    buttonWidth: "45px",
    fontSize: "12px",
    height: "30px",
    iconMarginRight: "4px",
    iconSize: "16px",
  },
  window: {
    cascadeOffset: 26,
    outline: "1px",
  },
};

export default sizes;
