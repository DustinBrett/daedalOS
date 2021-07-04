import extensions from "components/system/Files/FileEntry/extensions";

export const getIconByFileExtension = (extension: string): string =>
  `/icons/${extensions[extension]?.icon || "unknown"}.png`;

export const getProcessByFileExtension = (extension: string): string => {
  const [defaultProcess = ""] = extensions[extension]?.process || [];

  return defaultProcess;
};
