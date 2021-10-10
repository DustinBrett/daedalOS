import { FOLDER_ICON } from "components/system/Files/FileManager/useFolder";
import type { Processes } from "contexts/process/types";
import dynamic from "next/dynamic";

const processDirectory: Processes = {
  FileExplorer: {
    Component: dynamic(() => import("components/apps/FileExplorer")),
    backgroundColor: "#202020",
    icon: FOLDER_ICON,
    title: "File Explorer",
  },
  JSDOS: {
    Component: dynamic(() => import("components/apps/JSDOS")),
    autoSizing: true,
    backgroundColor: "#000",
    icon: "/System/Icons/jsdos.png",
    lockAspectRatio: true,
    title: "js-dos v7",
  },
  MonacoEditor: {
    Component: dynamic(() => import("components/apps/MonacoEditor")),
    backgroundColor: "#1E1E1E",
    defaultSize: {
      height: 400,
      width: 400,
    },
    icon: "/System/Icons/monaco.png",
    title: "Monaco Editor",
  },
  Photos: {
    Component: dynamic(() => import("components/apps/Photos")),
    backgroundColor: "#222",
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
    backgroundColor: "#000",
    defaultSize: {
      height: 400,
      width: 550,
    },
    icon: "/System/Icons/ruffle.png",
    title: "Ruffle",
  },
  TinyMCE: {
    Component: dynamic(() => import("components/apps/TinyMCE")),
    backgroundColor: "#FFF",
    defaultSize: {
      height: 400,
      width: 400,
    },
    icon: "/System/Icons/tinymce.png",
    title: "TinyMCE",
  },
  V86: {
    Component: dynamic(() => import("components/apps/V86")),
    allowResizing: false,
    autoSizing: true,
    backgroundColor: "#000",
    icon: "/System/Icons/v86.png",
    title: "Virtual x86",
  },
  VideoPlayer: {
    Component: dynamic(() => import("components/apps/VideoPlayer")),
    autoSizing: true,
    backgroundColor: "#000",
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
