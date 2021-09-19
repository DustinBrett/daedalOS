import type { Files } from "components/system/Files/FileManager/useFolder";
import type { Stats } from "fs";
import { basename, extname } from "path";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

const sortCaseInsensitive = (
  [a]: [string, Stats],
  [b]: [string, Stats]
): number => a.localeCompare(b, "en", { sensitivity: "base" });

export const sortContents = (contents: Files, sortOrder: string[]): Files => {
  if (sortOrder.length > 0) {
    const contentOrder = Object.keys(contents);

    return Object.fromEntries(
      [
        ...sortOrder.filter((entry) => contentOrder.includes(entry)),
        ...contentOrder.filter((entry) => !sortOrder.includes(entry)),
      ].map((entry) => [entry, contents[entry]])
    );
  }

  const files: [string, Stats][] = [];
  const folders: [string, Stats][] = [];

  Object.entries(contents).forEach((entry) => {
    const [, stat] = entry;

    if (!stat.isDirectory()) {
      files.push(entry);
    } else {
      folders.push(entry);
    }
  });

  return Object.fromEntries([
    ...folders.sort(sortCaseInsensitive),
    ...files.sort(sortCaseInsensitive),
  ]);
};

export const iterateFileName = (name: string, iteration: number): string => {
  const extension = extname(name);
  const fileName = basename(name, extension);

  return `${fileName} (${iteration})${extension}`;
};

export const haltEvent = (
  event: Event | React.DragEvent | React.KeyboardEvent | React.MouseEvent
): void => {
  event.preventDefault();
  event.stopPropagation();
};

export const handleFileInputEvent = (
  event: Event | React.DragEvent,
  callback: (fileName: string, buffer?: Buffer) => void
): void => {
  haltEvent(event);

  const eventTarget =
    (event as React.DragEvent)?.dataTransfer ||
    (event.currentTarget as HTMLInputElement);
  const eventFiles = eventTarget?.files || [];

  if (eventFiles.length > 0) {
    [...eventFiles].forEach((file) => {
      const reader = new FileReader();

      reader.addEventListener(
        "load",
        ({ target }) => {
          if (target?.result instanceof ArrayBuffer) {
            callback(file.name, Buffer.from(new Uint8Array(target.result)));
          }
        },
        ONE_TIME_PASSIVE_EVENT
      );
      reader.readAsArrayBuffer(file);
    });
  } else {
    const filePaths = eventTarget?.getData("text").split(",");

    filePaths.forEach((path) => callback(path));
  }
};
