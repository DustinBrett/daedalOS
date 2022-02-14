import type { Processes } from "contexts/process/types";
import dynamic from "next/dynamic";
import { FOLDER_ICON } from "utils/constants";

const processDirectory: Processes = {
  BoxedWine: {
    Component: dynamic(() => import("components/apps/BoxedWine")),
    allowResizing: false,
    background: "#000",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/boxedwine.png",
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
    icon: "/System/Icons/chromium.png",
    title: "Browser",
  },
  DevTools: {
    Component: dynamic(() => import("components/apps/DevTools")),
    background: "rgb(36, 36, 36)",
    defaultSize: {
      height: 380,
      width: 545,
    },
    icon: "/System/Icons/eruda.png",
    singleton: true,
    title: "DevTools",
  },
  Dialog: {
    Component: dynamic(() => import("components/system/Dialog")),
    allowResizing: false,
    background: "#FFF",
    defaultSize: {
      height: 163,
      width: 400,
    },
    icon: "/System/Icons/copying.png",
    title: "Dialog",
  },
  FileExplorer: {
    Component: dynamic(() => import("components/apps/FileExplorer")),
    background: "#202020",
    icon: FOLDER_ICON,
    title: "File Explorer",
  },
  IRC: {
    Component: dynamic(() => import("components/apps/IRC")),
    background: "#000",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/irc.png",
    title: "IRC",
  },
  JSDOS: {
    Component: dynamic(() => import("components/apps/JSDOS")),
    autoSizing: true,
    background: "#000",
    defaultSize: {
      height: 200,
      width: 320,
    },
    icon: "/System/Icons/jsdos.png",
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
    icon: "/System/Icons/marked.png",
    title: "Marked",
  },
  MonacoEditor: {
    Component: dynamic(() => import("components/apps/MonacoEditor")),
    background: "#1E1E1E",
    defaultSize: {
      height: 480,
      width: 544,
    },
    icon: "/System/Icons/monaco.png",
    title: "Monaco Editor",
  },
  PDF: {
    Component: dynamic(() => import("components/apps/PDF")),
    background: "rgb(82, 86, 89)",
    defaultSize: {
      height: 480,
      width: 640,
    },
    icon: "/System/Icons/pdf.png",
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
    icon: "/System/Icons/photos.png",
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
    icon: "/System/Icons/ruffle.png",
    lockAspectRatio: true,
    title: "Ruffle",
  },
  SpaceCadet: {
    Component: dynamic(() => import("components/apps/SpaceCadet")),
    background: "#000",
    defaultSize: {
      height: 440,
      width: 600,
    },
    icon: "/System/Icons/pinball.png",
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
    icon: "/System/Icons/xterm.png",
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
    icon: "/System/Icons/tinymce.png",
    singleton: true,
    title: "TinyMCE",
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
    icon: "/System/Icons/v86.png",
    singleton: true,
    title: "Virtual x86",
  },
  VideoPlayer: {
    Component: dynamic(() => import("components/apps/VideoPlayer")),
    autoSizing: true,
    background: "#000",
    icon: "/System/Icons/vlc.png",
    title: "Video Player",
  },
  Webamp: {
    Component: dynamic(() => import("components/apps/Webamp")),
    hasWindow: false,
    icon: "/System/Icons/webamp.png",
    singleton: true,
    title: "Webamp",
  },
};

export default processDirectory;
