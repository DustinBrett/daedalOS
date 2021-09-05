import { DEFAULT_FILE_VIEWER } from "utils/constants";

type Extension = {
  icon?: string;
  process: string[];
};

const extensions = {
  ".img": {
    icon: "image",
    process: ["V86"],
  },
  ".iso": {
    icon: "image",
    process: ["FileExplorer", "V86"],
  },
  ".jsdos": {
    icon: "jsdos",
    process: ["JSDOS", "FileExplorer"],
  },
  ".mp3": {
    icon: "music",
    process: ["Webamp"],
  },
  ".spl": {
    process: ["Ruffle"],
  },
  ".swf": {
    process: ["Ruffle"],
  },
  ".whtml": {
    icon: "tinymce",
    process: ["TinyMCE", DEFAULT_FILE_VIEWER],
  },
  ".wsz": {
    icon: "music",
    process: ["Webamp", "FileExplorer"],
  },
  ".zip": {
    icon: "compressed",
    process: ["FileExplorer", "JSDOS"],
  },
};

export type ExtensionType = keyof typeof extensions;

export default extensions as Record<ExtensionType, Extension>;
