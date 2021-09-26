type Extension = {
  icon?: string;
  process: string[];
  type?: string;
};

const extensions = {
  ".img": {
    icon: "image",
    process: ["V86"],
    type: "Disc Image File",
  },
  ".iso": {
    icon: "image",
    process: ["FileExplorer", "V86"],
    type: "Disk Image File",
  },
  ".jsdos": {
    icon: "jsdos",
    process: ["JSDOS", "FileExplorer"],
  },
  ".mkv": { process: ["VideoPlayer"] },
  ".mp3": {
    icon: "music",
    process: ["Webamp"],
  },
  ".mp4": { process: ["VideoPlayer"] },
  ".ogg": { process: ["VideoPlayer"] },
  ".ogm": { process: ["VideoPlayer"] },
  ".ogv": { process: ["VideoPlayer"] },
  ".spl": {
    process: ["Ruffle"],
    type: "FutureSplash File",
  },
  ".swf": {
    process: ["Ruffle"],
    type: "Shockwave Flash File",
  },
  ".whtml": {
    icon: "tinymce",
    process: ["TinyMCE", "MonacoEditor"],
    type: "WYSIWYG HTML File",
  },
  ".webm": { process: ["VideoPlayer"] },
  ".wsz": {
    icon: "music",
    process: ["Webamp", "FileExplorer"],
    type: "Winamp Skin File",
  },
  ".zip": {
    icon: "compressed",
    process: ["FileExplorer", "JSDOS"],
    type: "Compressed (zipped) Folder",
  },
};

export type ExtensionType = keyof typeof extensions;

export default extensions as Record<ExtensionType, Extension>;
