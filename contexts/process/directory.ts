import type { Processes } from "contexts/process/types";
import dynamic from "next/dynamic";
import { FOLDER_ICON, TASKBAR_HEIGHT } from "utils/constants";

const processDirectory: Processes = {
  BoxedWine: {
    Component: dynamic(() => import("components/apps/BoxedWine")),
    allowResizing: false,
    background: "#000",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/boxedwine.avif",
    singleton: true,
    title: "BoxedWine",
  },
  Browser: {
    Component: dynamic(() => import("components/apps/Browser")),
    background: "#FFF",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/chromium.avif",
    title: "Browser",
  },
  Byuu: {
    Component: dynamic(() => import("components/apps/Byuu")),
    autoSizing: true,
    background: "#000",
    defaultSize: {
      height: 240,
      width: 256,
    },
    icon: "/System/Icons/byuu.avif",
    lockAspectRatio: true,
    title: "Byuu",
  },
  DXBall: {
    Component: dynamic(() => import("components/apps/DX-Ball")),
    background: "#000",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/dxball.avif",
    lockAspectRatio: true,
    title: "DX-Ball",
  },
  DevTools: {
    Component: dynamic(() => import("components/apps/DevTools")),
    background: "rgb(36, 36, 36)",
    defaultSize: {
      height: 380,
      width: 545,
    },
    icon: "/System/Icons/eruda.avif",
    singleton: true,
    title: "DevTools",
  },
  FileExplorer: {
    Component: dynamic(() => import("components/apps/FileExplorer")),
    background: "#202020",
    icon: FOLDER_ICON,
    title: "File Explorer",
  },
  JSDOS: {
    Component: dynamic(() => import("components/apps/JSDOS")),
    autoSizing: true,
    background: "#000",
    defaultSize: {
      height: 200,
      width: 320,
    },
    icon: "/System/Icons/jsdos.avif",
    lockAspectRatio: true,
    title: "js-dos v7",
  },
  Marked: {
    Component: dynamic(() => import("components/apps/Marked")),
    background: "#FFF",
    defaultSize: {
      height: 480,
      width: 560,
    },
    icon: "/System/Icons/marked.avif",
    title: "Marked",
  },
  MonacoEditor: {
    Component: dynamic(() => import("components/apps/MonacoEditor")),
    background: "#1E1E1E",
    defaultSize: {
      height: 480,
      width: 544,
    },
    icon: "/System/Icons/monaco.avif",
    title: "Monaco Editor",
  },
  PDF: {
    Component: dynamic(() => import("components/apps/PDF")),
    background: "rgb(82, 86, 89)",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/pdf.avif",
    title: "PDF",
  },
  Photos: {
    Component: dynamic(() => import("components/apps/Photos")),
    background: "#222",
    defaultSize: {
      height: 432,
      width: 576,
    },
    hideTitlebarIcon: true,
    icon: "/System/Icons/photos.avif",
    prependTaskbarTitle: true,
    title: "Photos",
  },
  Ruffle: {
    Component: dynamic(() => import("components/apps/Ruffle")),
    background: "#000",
    defaultSize: {
      height: 400,
      width: 550,
    },
    icon: "/System/Icons/ruffle.avif",
    lockAspectRatio: true,
    title: "Ruffle",
  },
  Run: {
    Component: dynamic(() => import("components/system/Dialogs/Run")),
    allowResizing: false,
    defaultSize: {
      height: 174,
      width: 397,
    },
    hideMaximizeButton: true,
    hideMinimizeButton: true,
    icon: "/System/Icons/run.avif",
    initialRelativePosition: {
      bottom: TASKBAR_HEIGHT + 11,
      left: 15,
    },
    singleton: true,
    title: "Run",
  },
  SpaceCadet: {
    Component: dynamic(() => import("components/apps/SpaceCadet")),
    background: "#000",
    defaultSize: {
      height: 440,
      width: 600,
    },
    icon: "/System/Icons/pinball.avif",
    lockAspectRatio: true,
    singleton: true,
    title: "Space Cadet",
  },
  Terminal: {
    Component: dynamic(() => import("components/apps/Terminal")),
    background: "rgba(12, 12, 12, 0.5)",
    defaultSize: {
      height: 340,
      width: 553,
    },
    icon: "/System/Icons/xterm.avif",
    lockAspectRatio: true,
    title: "Terminal",
  },
  TinyMCE: {
    Component: dynamic(() => import("components/apps/TinyMCE")),
    background: "#FFF",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/tinymce.avif",
    singleton: true,
    title: "TinyMCE",
  },
  TransferDialog: {
    Component: dynamic(() => import("components/system/Dialogs/Transfer")),
    allowResizing: false,
    background: "#FFF",
    defaultSize: {
      height: 163,
      width: 400,
    },
    icon: "/System/Icons/copying.avif",
    title: "Dialog",
  },
  V86: {
    Component: dynamic(() => import("components/apps/V86")),
    allowResizing: false,
    autoSizing: true,
    background: "#000",
    defaultSize: {
      height: 200,
      width: 320,
    },
    icon: "/System/Icons/v86.avif",
    singleton: true,
    title: "Virtual x86",
  },
  VideoPlayer: {
    Component: dynamic(() => import("components/apps/VideoPlayer")),
    autoSizing: true,
    background: "#000",
    icon: "/System/Icons/vlc.avif",
    title: "Video Player",
  },
  Vim: {
    Component: dynamic(() => import("components/apps/Vim")),
    allowResizing: false,
    background: "rgb(34, 35, 36)",
    defaultSize: {
      height: 448,
      width: 595,
    },
    icon: "/System/Icons/vim.avif",
    singleton: true,
    title: "Vim",
  },
  Webamp: {
    Component: dynamic(() => import("components/apps/Webamp")),
    allowResizing: false,
    hasWindow: false,
    icon: "/System/Icons/webamp.avif",
    singleton: true,
    title: "Webamp",
  },
};

export default processDirectory;
