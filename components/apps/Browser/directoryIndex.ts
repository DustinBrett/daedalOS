import { basename } from "path";
import extensions from "components/system/Files/FileEntry/extensions";
import { getExtension, getTZOffsetISOString } from "utils/functions";
import { ROOT_NAME } from "utils/constants";

export type DirectoryEntries = {
  alt?: string;
  description?: string;
  href: string;
  icon?: string;
  modified?: number;
  size?: number;
};

const DIRECTORY_INDEX_ICON_PATH = "/Program Files/Browser/directory/icons";

const iconExtMap = {
  ".7z": "compressed",
  ".gz": "compressed",
  ".ini": "text",
  ".js": "text",
  ".json": "text",
  ".pk3": "compressed",
  ".rar": "compressed",
  ".sh": "script",
  ".tar": "tar",
  ".tgz": "compressed",
  ".txt": "text",
  ".url": "link",
  ".wsz": "compressed",
};

const extensionIconToIndexIcon: Record<string, string> = {
  "FutureSplash File": "portal",
  "HTML Document": "layout",
  "Media Playlist File": "movie",
  "Picture File": "image2",
  "Shockwave Flash File": "portal",
  audio: "sound2",
  compressed: "compressed",
  emulator: "portal",
  executable: "binary",
  font: "a",
  image: "diskimg",
  jsdos: "compressed",
  marked: "layout",
  pdf: "layout",
  python: "p",
  tinymce: "layout",
  wapm: "binary",
};

const iconMap: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(extensions).map(([ext, { icon = "", type = "" }]) => [
      ext,
      extensionIconToIndexIcon[icon || type] || "generic",
    ])
  ),
  ...iconExtMap,
};

const altIconMap: Record<string, string> = {
  back: "PARENTDIR",
  folder: "DIR",
  image2: "IMG",
  movie: "VID",
  text: "TXT",
};

const formatSize = (size?: number): string => {
  if (size === undefined) return " - ";

  const units = ["", "K", "M", "G", "T"];

  let power = Math.floor((size ? Math.log(size) : 0) / Math.log(1024));
  power = Math.min(power, units.length - 1);
  let newSize = size / 1024 ** power;
  newSize =
    newSize >= 100 ? Math.round(newSize) : Math.round(newSize * 10) / 10;
  let newNumber = newSize.toString();

  if (newNumber.length > 3) {
    newNumber = Math.round(newSize).toString();
  }

  const addTrailingZero = newSize !== 0 && newSize < 10 && newSize % 1 === 0;

  return newNumber + (addTrailingZero ? ".0" : "") + units[power];
};

const formatDate = (timestamp?: number): string =>
  timestamp
    ? getTZOffsetISOString(timestamp)
        .replace("T", " ")
        .split(".")[0]
        .slice(0, -3)
    : "";

export const createDirectoryIndex = (
  url: string,
  origin: string,
  { C, O }: Record<string, string>,
  data: DirectoryEntries[]
): string => `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title>Index of ${url}</title>
      <style>
        a:visited { color: #00e; }
        img { display: block; }
      </style>
    </head>
    <body>
      <h1>Index of ${url}</h1>
      <table>
        <tr>
          <th valign="top"><img decoding="async" src="${DIRECTORY_INDEX_ICON_PATH}/blank.gif" alt="[ICO]" /></th>
          <th><a href="${origin}?C=N;O=${!C || (C === "N" && O === "A") ? "D" : "A"}">Name</a></th><th><a href="${origin}?C=M;O=${C === "M" && O === "A" ? "D" : "A"}">Last modified</a></th>
          <th><a href="${origin}?C=S;O=${C === "S" && O === "A" ? "D" : "A"}">Size</a></th><th><a href="${origin}?C=D;O=${C === "D" && O === "A" ? "D" : "A"}">Description</a></th>
        </tr>
        <tr>
          <th colspan="5"><hr /></th>
        </tr>
        ${data
          .map(({ alt, description, href, icon, modified, size }) => {
            const entryIcon = icon || iconMap[getExtension(href)] || "generic";
            const isBack = entryIcon === "back";
            const linkType =
              isBack || entryIcon === "folder" ? "folder" : "file";
            const name = isBack
              ? "Parent Directory"
              : href === "/"
                ? ROOT_NAME
                : basename(href);

            return `
              <tr>
                <td valign="top">
                  <a href="${origin}${href}" type=${linkType}>
                    <img decoding="async" src="${DIRECTORY_INDEX_ICON_PATH}/${entryIcon}.gif" alt="[${altIconMap[entryIcon] || alt || "   "}]">
                  </a>
                </td>
                <td>
                  <a href="${origin}${href}" type=${linkType}>${name}${entryIcon === "folder" ? "/" : ""}</a>
                </td>
                <td align="right">${formatDate(modified)}</td>
                <td align="right">${formatSize(size)}</td>
                <td>${description || "&nbsp;"}</td>
              </tr>`;
          })
          .join("")}
          <tr><th colspan="5"><hr /></th></tr>
      </table>
    </body>
  </html>
`;
