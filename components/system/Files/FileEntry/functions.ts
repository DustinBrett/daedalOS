type Extensions = {
  [extension: string]: {
    icon: string;
    process: string[];
  };
};

export const extensions: Extensions = {
  ".img": {
    icon: "image",
    process: ["V86"],
  },
  ".iso": {
    icon: "image",
    process: ["FileExplorer", "V86"],
  },
  ".jsdos": {
    icon: "compressed",
    process: ["JSDOS"],
  },
  ".mp3": {
    icon: "music",
    process: ["Webamp"],
  },
  ".wsz": {
    icon: "music",
    process: ["Webamp"],
  },
  ".zip": {
    icon: "compressed",
    process: ["FileExplorer", "JSDOS"],
  },
};

export const getIconByFileExtension = (extension: string): string =>
  `/icons/${extensions[extension]?.icon || "unknown"}.png`;

export const getProcessByFileExtension = (extension: string): string => {
  const [defaultProcess = ""] = extensions[extension]?.process || [];

  return defaultProcess;
};
