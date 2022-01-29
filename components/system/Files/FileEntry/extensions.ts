type Extension = {
  command?: string;
  icon?: string;
  process: string[];
  type?: string;
};

const extensions = {
  ".exe": {
    icon: "executable",
    process: ["BoxedWine", "JSDOS"],
    type: "Application",
  },
  ".htm": {
    process: ["Browser", "MonacoEditor"],
    type: "HTML Document",
  },
  ".html": {
    process: ["Browser", "MonacoEditor"],
    type: "HTML Document",
  },
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
    type: "JSDOS Bundle",
  },
  ".md": {
    icon: "marked",
    process: ["Marked", "MonacoEditor"],
  },
  ".mp3": {
    icon: "audio",
    process: ["Webamp"],
  },
  ".pdf": {
    icon: "pdf",
    process: ["PDF"],
    type: "PDF Document",
  },
  ".py": {
    command: "py",
    icon: "python",
    process: ["Terminal", "MonacoEditor"],
    type: "Python File",
  },
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
  ".wsz": {
    icon: "audio",
    process: ["Webamp", "FileExplorer"],
    type: "Winamp Skin File",
  },
  ".zip": {
    icon: "compressed",
    process: ["FileExplorer", "BoxedWine", "JSDOS"],
    type: "Compressed (zipped) Folder",
  },
};

export type ExtensionType = keyof typeof extensions;

export default extensions as Record<ExtensionType, Extension>;
