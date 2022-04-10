type Extension = {
  command?: string;
  icon?: string;
  process: string[];
  type?: string;
};

const types = {
  Application: {
    icon: "executable",
    process: ["BoxedWine", "JSDOS"],
    type: "Application",
  },
  DiscImage: {
    icon: "image",
    process: ["V86"],
    type: "Disc Image File",
  },
  FutureSplash: {
    process: ["Ruffle"],
    type: "FutureSplash File",
  },
  HtmlDocument: {
    process: ["Browser", "MonacoEditor"],
    type: "HTML Document",
  },
  JsdosBundle: {
    icon: "jsdos",
    process: ["JSDOS", "FileExplorer"],
    type: "JSDOS Bundle",
  },
  Markdown: {
    icon: "marked",
    process: ["Marked", "MonacoEditor"],
    type: "Markdown File",
  },
  MountableDiscImage: {
    icon: "image",
    process: ["FileExplorer", "V86"],
    type: "Disc Image File",
  },
  Music: {
    icon: "audio",
    process: ["Webamp"],
  },
  NintendoRom: {
    icon: "rom",
    process: ["Byuu"],
    type: "Nintendo ROM File",
  },
  PdfDocument: {
    icon: "pdf",
    process: ["PDF"],
    type: "PDF Document",
  },
  PythonFile: {
    command: "py",
    icon: "python",
    process: ["Terminal", "MonacoEditor"],
    type: "Python File",
  },
  SegaGenesisRom: {
    icon: "rom",
    process: ["Byuu"],
    type: "Sega Genesis ROM File",
  },
  ShockwaveFlash: {
    process: ["Ruffle"],
    type: "Shockwave Flash File",
  },
  SuperNintendoRom: {
    icon: "rom",
    process: ["Byuu"],
    type: "Super Nintendo ROM File",
  },
  SvgFile: {
    process: ["Photos", "MonacoEditor"],
    type: "Scalable Vector Graphics File",
  },
  WinampSkin: {
    icon: "audio",
    process: ["Webamp", "FileExplorer"],
    type: "Winamp Skin File",
  },
  WysiwygHtmlDocument: {
    icon: "tinymce",
    process: ["TinyMCE", "MonacoEditor"],
    type: "WYSIWYG HTML File",
  },
  ZipFile: {
    icon: "compressed",
    process: ["FileExplorer", "BoxedWine", "JSDOS"],
    type: "Compressed (zipped) Folder",
  },
};

const extensions = {
  ".exe": types.Application,
  ".gen": types.SegaGenesisRom,
  ".htm": types.HtmlDocument,
  ".html": types.HtmlDocument,
  ".img": types.DiscImage,
  ".iso": types.MountableDiscImage,
  ".jsdos": types.JsdosBundle,
  ".md": types.Markdown,
  ".mp3": types.Music,
  ".nes": types.NintendoRom,
  ".pdf": types.PdfDocument,
  ".py": types.PythonFile,
  ".sfc": types.SuperNintendoRom,
  ".smc": types.SuperNintendoRom,
  ".smd": types.SegaGenesisRom,
  ".spl": types.FutureSplash,
  ".svg": types.SvgFile,
  ".swf": types.ShockwaveFlash,
  ".whtml": types.WysiwygHtmlDocument,
  ".wsz": types.WinampSkin,
  ".zip": types.ZipFile,
};

export type ExtensionType = keyof typeof extensions;

export default extensions as Record<ExtensionType, Extension>;
