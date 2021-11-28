import type { Processes } from "contexts/process/types";
import dynamic from "next/dynamic";
import { FOLDER_ICON } from "utils/constants";

const processDirectory: Processes = {
  Browser: {
    Component: dynamic(() => import("components/apps/Browser")),
    background: "#fff",
    defaultSize: {
      height: 500,
      width: 550,
    },
    icon: "/System/Icons/chromium.png",
    title: "Browser",
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
    icon: "/System/Icons/jsdos.png",
    lockAspectRatio: true,
    singleton: true,
    title: "js-dos v7",
  },
  MonacoEditor: {
    Component: dynamic(() => import("components/apps/MonacoEditor")),
    background: "#1E1E1E",
    defaultSize: {
      height: 400,
      width: 400,
    },
    icon: "/System/Icons/monaco.png",
    title: "Monaco Editor",
  },
  Photos: {
    Component: dynamic(() => import("components/apps/Photos")),
    background: "#222",
    defaultSize: {
      height: 400,
      width: 500,
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
    allowResizing: false,
    background: "rgba(12, 12, 12, 0.6)",
    defaultSize: {
      height: 340,
      width: 560,
    },
    icon: "/System/Icons/xterm.png",
    title: "Terminal",
  },
  TinyMCE: {
    Component: dynamic(() => import("components/apps/TinyMCE")),
    background: "#FFF",
    defaultSize: {
      height: 400,
      width: 400,
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
