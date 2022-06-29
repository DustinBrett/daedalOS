import { getIconByFileExtension } from "components/system/Files/FileEntry/functions";
import type { FolderActions } from "components/system/Files/FileManager/useFolder";
import type {
  SortBy,
  SortByOrder,
} from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import type { ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { join } from "path";
import { useCallback } from "react";
import {
  FOLDER_ICON,
  isFileSystemSupported,
  MENU_SEPERATOR,
} from "utils/constants";

const NEW_FOLDER = "New folder";
const NEW_TEXT_DOCUMENT = "New Text Document.txt";
const NEW_RTF_DOCUMENT = "New Rich Text Document.whtml";

const richTextDocumentIcon = getIconByFileExtension(".whtml");
const textDocumentIcon = getIconByFileExtension(".txt");

const updateSortBy =
  (value: SortBy, defaultIsAscending: boolean) =>
  ([sortBy, isAscending]: SortByOrder): SortByOrder =>
    [value, sortBy === value ? !isAscending : defaultIsAscending];

const EASTER_EGG_CLICK_COUNT = 2;

let triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;

const useFolderContextMenu = (
  url: string,
  {
    addToFolder,
    newPath,
    pasteToFolder,
    sortByOrder: [[sortBy, isAscending], setSortBy],
  }: FolderActions,
  isDesktop?: boolean
): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { mapFs, pasteList = {}, updateFolder } = useFileSystem();
  const { setWallpaper: setSessionWallpaper, wallpaperImage } = useSession();
  const setWallpaper = useCallback(
    (wallpaper: string) => {
      if (wallpaper === "VANTA") {
        triggerEasterEggCountdown -= 1;

        const triggerEasterEgg = triggerEasterEggCountdown === 0;

        setSessionWallpaper(`VANTA${triggerEasterEgg ? " WIREFRAME" : ""}`);

        if (triggerEasterEgg) {
          triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;
        }
      } else {
        triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;

        setSessionWallpaper(wallpaper);
      }
    },
    [setSessionWallpaper]
  );
  const { open } = useProcesses();
  const getItems = useCallback(() => {
    const ADD_FILE = { action: () => addToFolder(), label: "Add file(s)" };
    const MAP_DIRECTORY = {
      action: () =>
        mapFs(url)
          .then((mappedFolder) => {
            updateFolder(url, mappedFolder);
            open("FileExplorer", { url: join(url, mappedFolder) });
          })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {}),
      label: "Map directory",
    };
    const FS_COMMANDS = isFileSystemSupported()
      ? [ADD_FILE, MAP_DIRECTORY]
      : [ADD_FILE];

    return [
      {
        label: "Sort by",
        menu: [
          {
            action: () => setSortBy(updateSortBy("name", true)),
            label: "Name",
            toggle: sortBy === "name",
          },
          {
            action: () => setSortBy(updateSortBy("size", false)),
            label: "Size",
            toggle: sortBy === "size",
          },
          {
            action: () => setSortBy(updateSortBy("type", true)),
            label: "Item type",
            toggle: sortBy === "type",
          },
          {
            action: () => setSortBy(updateSortBy("date", false)),
            label: "Date modified",
            toggle: sortBy === "date",
          },
          MENU_SEPERATOR,
          {
            action: () => setSortBy(([value]) => [value, true]),
            label: "Ascending",
            toggle: isAscending,
          },
          {
            action: () => setSortBy(([value]) => [value, false]),
            label: "Descending",
            toggle: !isAscending,
          },
        ],
      },
      { action: () => updateFolder(url), label: "Refresh" },
      ...(isDesktop
        ? [
            MENU_SEPERATOR,
            {
              label: "Wallpaper",
              menu: [
                {
                  action: () => setWallpaper("APOD"),
                  label: "APOD",
                  toggle: wallpaperImage.startsWith("APOD"),
                },
                {
                  action: () => setWallpaper("COASTAL_LANDSCAPE"),
                  label: "Coastal Landscape",
                  toggle: wallpaperImage === "COASTAL_LANDSCAPE",
                },
                {
                  action: () => setWallpaper("HEXELLS"),
                  label: "Hexells",
                  toggle: wallpaperImage === "HEXELLS",
                },
                {
                  action: () => setWallpaper("VANTA"),
                  label: `Vanta Waves${
                    wallpaperImage === "VANTA WIREFRAME" ? " (Wireframe)" : ""
                  }`,
                  toggle: wallpaperImage.startsWith("VANTA"),
                },
              ],
            },
          ]
        : []),
      MENU_SEPERATOR,
      ...FS_COMMANDS,
      {
        action: () => pasteToFolder(),
        disabled: Object.keys(pasteList).length === 0,
        label: "Paste",
      },
      MENU_SEPERATOR,
      {
        label: "New",
        menu: [
          {
            action: () => newPath(NEW_FOLDER, undefined, "rename"),
            icon: FOLDER_ICON,
            label: "Folder",
          },
          MENU_SEPERATOR,
          {
            action: () => newPath(NEW_RTF_DOCUMENT, Buffer.from(""), "rename"),
            icon: richTextDocumentIcon,
            label: "Rich Text Document",
          },
          {
            action: () => newPath(NEW_TEXT_DOCUMENT, Buffer.from(""), "rename"),
            icon: textDocumentIcon,
            label: "Text Document",
          },
        ],
      },
      ...(isDesktop
        ? [
            MENU_SEPERATOR,
            {
              action: () => open("DevTools", { url: "dom" }),
              label: "Inspect",
            },
          ]
        : []),
    ];
  }, [
    addToFolder,
    isAscending,
    isDesktop,
    mapFs,
    newPath,
    open,
    pasteList,
    pasteToFolder,
    setSortBy,
    setWallpaper,
    sortBy,
    updateFolder,
    url,
    wallpaperImage,
  ]);

  return contextMenu?.(getItems);
};

export default useFolderContextMenu;
