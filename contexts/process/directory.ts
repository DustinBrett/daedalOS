import type { Processes } from "contexts/process/types";
import dynamic from "next/dynamic";

const processDirectory: Processes = {
  FileExplorer: {
    backgroundColor: "#202020",
    Component: dynamic(() => import("components/apps/FileExplorer")),
    icon: "/System/Icons/explorer.png",
    title: "File Explorer",
  },
  JSDOS: {
    autoSizing: true,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/JSDOS")),
    icon: "/System/Icons/jsdos.png",
    lockAspectRatio: true,
    title: "js-dos v7",
  },
  MonacoEditor: {
    backgroundColor: "#1E1E1E",
    Component: dynamic(() => import("components/apps/MonacoEditor")),
    defaultSize: {
      height: 400,
      width: 400,
    },
    icon: "/System/Icons/monaco.png",
    title: "Monaco Editor",
  },
  Photos: {
    backgroundColor: "#222",
    Component: dynamic(() => import("components/apps/Photos")),
    defaultSize: {
      height: 400,
      width: 500,
    },
    icon: "/System/Icons/photos.png",
    prependTaskbarTitle: true,
    title: "Photos",
  },
  Ruffle: {
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/Ruffle")),
    defaultSize: {
      height: 400,
      width: 550,
    },
    icon: "/System/Icons/ruffle.png",
    title: "Ruffle",
  },
  TinyMCE: {
    backgroundColor: "#FFF",
    Component: dynamic(() => import("components/apps/TinyMCE")),
    defaultSize: {
      height: 400,
      width: 400,
    },
    icon: "/System/Icons/tinymce.png",
    title: "TinyMCE",
  },
  V86: {
    autoSizing: true,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/V86")),
    icon: "/System/Icons/v86.png",
    title: "Virtual x86",
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
