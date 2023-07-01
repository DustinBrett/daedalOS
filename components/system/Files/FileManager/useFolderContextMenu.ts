import { WALLPAPER_MENU } from "components/system/Desktop/Wallpapers/constants";
import { getIconByFileExtension } from "components/system/Files/FileEntry/functions";
import type { FolderActions } from "components/system/Files/FileManager/useFolder";
import type {
  SortBy,
  SortByOrder,
} from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import type {
  ContextMenuCapture,
  MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useWebGPUCheck } from "hooks/useWebGPUCheck";
import { basename, dirname, join } from "path";
import { useCallback, useMemo } from "react";
import {
  DESKTOP_PATH,
  FOLDER_ICON,
  INDEX_FILE,
  MENU_SEPERATOR,
  MOUNTABLE_EXTENSIONS,
} from "utils/constants";
import {
  bufferToBlob,
  generatePrettyTimestamp,
  getExtension,
  isFileSystemMappingSupported,
  isFirefox,
  isSafari,
} from "utils/functions";

const stopGlobalMusicVisualization = (): void =>
  window.WebampGlobal?.store.dispatch({
    enabled: false,
    type: "SET_MILKDROP_DESKTOP",
  });

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
const CAPTURE_FPS = 30;
const MIME_TYPE_VIDEO_WEBM = "video/webm";
const MIME_TYPE_VIDEO_MP4 = "video/mp4";

let triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;

let currentMediaStream: MediaStream | undefined;

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
  const {
    exists,
    mapFs,
    pasteList = {},
    readFile,
    writeFile,
    updateFolder,
  } = useFileSystem();
  const {
    setWallpaper: setSessionWallpaper,
    setIconPositions,
    wallpaperImage,
  } = useSession();
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
  const updateSorting = useCallback(
    (value: SortBy | "", defaultIsAscending: boolean): void => {
      setIconPositions((currentIconPositions) =>
        Object.fromEntries(
          Object.entries(currentIconPositions).filter(
            ([entryPath]) => dirname(entryPath) !== url
          )
        )
      );
      setSortBy(
        value === ""
          ? ([currentValue]) => [currentValue, defaultIsAscending]
          : updateSortBy(value, defaultIsAscending)
      );
    },
    [setIconPositions, setSortBy, url]
  );
  const canCapture = useMemo(
    () =>
      isDesktop &&
      typeof window !== "undefined" &&
      typeof navigator?.mediaDevices?.getDisplayMedia === "function" &&
      (window?.MediaRecorder?.isTypeSupported(MIME_TYPE_VIDEO_WEBM) ||
        window?.MediaRecorder?.isTypeSupported(MIME_TYPE_VIDEO_MP4)) &&
      !isSafari(),
    [isDesktop]
  );
  const captureScreen = useCallback(async () => {
    if (currentMediaStream) {
      const { active: wasActive } = currentMediaStream;

      currentMediaStream.getTracks().forEach((track) => track.stop());
      currentMediaStream = undefined;

      if (wasActive) return;
    }

    const displayMediaOptions: DisplayMediaStreamOptions &
      MediaStreamConstraints = {
      video: {
        frameRate: CAPTURE_FPS,
      },
      ...(!isFirefox() &&
        !isSafari() && {
          preferCurrentTab: true,
          selfBrowserSurface: "include",
          surfaceSwitching: "include",
          systemAudio: "include",
        }),
    };
    currentMediaStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );

    const [currentVideoTrack] = currentMediaStream.getVideoTracks();
    const { height, width } = currentVideoTrack.getSettings();
    const mediaRecorder = new MediaRecorder(currentMediaStream, {
      bitsPerSecond: height && width ? height * width * CAPTURE_FPS : undefined,
      mimeType: MediaRecorder.isTypeSupported(MIME_TYPE_VIDEO_WEBM)
        ? MIME_TYPE_VIDEO_WEBM
        : MIME_TYPE_VIDEO_MP4,
    });
    const fileName = `Screen Capture ${generatePrettyTimestamp()}.webm`;
    const capturePath = join(DESKTOP_PATH, fileName);
    const startTime = Date.now();
    let hasCapturedData = false;

    mediaRecorder.start();
    mediaRecorder.addEventListener("dataavailable", async (event) => {
      const { data } = event;

      if (data) {
        const bufferData = Buffer.from(await data.arrayBuffer());

        await writeFile(
          capturePath,
          hasCapturedData
            ? Buffer.concat([await readFile(capturePath), bufferData])
            : bufferData,
          hasCapturedData
        );

        if (mediaRecorder.state === "inactive") {
          const { default: fixWebmDuration } = await import(
            "fix-webm-duration"
          );

          fixWebmDuration(
            bufferToBlob(await readFile(capturePath)),
            Date.now() - startTime,
            async (capturedFile) => {
              await writeFile(
                capturePath,
                Buffer.from(await capturedFile.arrayBuffer()),
                true
              );
              updateFolder(DESKTOP_PATH, fileName);
            }
          );
        }

        hasCapturedData = true;
      }
    });
  }, [readFile, updateFolder, writeFile]);
  const hasWebGPU = useWebGPUCheck();

  return useMemo(
    () =>
      contextMenu?.(() => {
        const ADD_FILE = { action: () => addToFolder(), label: "Add file(s)" };
        const MAP_DIRECTORY = {
          action: () =>
            mapFs(url)
              .then((mappedFolder) => {
                updateFolder(url, mappedFolder);
                open("FileExplorer", { url: join(url, mappedFolder) });
              })
              .catch(() => {
                // Ignore failure to map
              }),
          label: "Map directory",
        };
        const FS_COMMANDS = [
          ADD_FILE,
          ...(isFileSystemMappingSupported() ? [MAP_DIRECTORY] : []),
        ];
        const isMusicVisualizationRunning =
          document.querySelector("main .webamp-desktop canvas") instanceof
          HTMLCanvasElement;
        const isReadOnly = MOUNTABLE_EXTENSIONS.has(getExtension(url));

        return [
          {
            label: "Sort by",
            menu: [
              {
                action: () => updateSorting("name", true),
                label: "Name",
                toggle: sortBy === "name",
              },
              {
                action: () => updateSorting("size", false),
                label: "Size",
                toggle: sortBy === "size",
              },
              {
                action: () => updateSorting("type", true),
                label: "Item type",
                toggle: sortBy === "type",
              },
              {
                action: () => updateSorting("date", false),
                label: "Date modified",
                toggle: sortBy === "date",
              },
              MENU_SEPERATOR,
              {
                action: () => updateSorting("", true),
                label: "Ascending",
                toggle: isAscending,
              },
              {
                action: () => updateSorting("", false),
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
                  label: "Background",
                  menu: WALLPAPER_MENU.filter(
                    ({ requiresWebGPU }) => !requiresWebGPU || hasWebGPU
                  ).reduce<MenuItem[]>(
                    (menu, item) => [
                      ...menu,
                      {
                        action: () => {
                          if (isMusicVisualizationRunning) {
                            stopGlobalMusicVisualization?.();
                          }
                          if (item.id) setWallpaper(item.id);
                        },
                        label: item.name || item.id,
                        toggle: item.startsWith
                          ? wallpaperImage.startsWith(item.id)
                          : wallpaperImage === item.id,
                      },
                    ],
                    isMusicVisualizationRunning
                      ? [
                          {
                            action: stopGlobalMusicVisualization,
                            checked: true,
                            label: "Music Visualization",
                          },
                          MENU_SEPERATOR,
                        ]
                      : []
                  ),
                },
                ...(canCapture
                  ? [
                      {
                        action: captureScreen,
                        label: currentMediaStream?.active
                          ? "Stop screen capture"
                          : "Capture screen",
                      },
                    ]
                  : []),
              ]
            : []),
          ...(isReadOnly
            ? []
            : [
                MENU_SEPERATOR,
                ...FS_COMMANDS,
                {
                  action: () => open("Terminal", { url }),
                  label: "Open Terminal here",
                },
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
                      action: () =>
                        newPath(NEW_RTF_DOCUMENT, Buffer.from(""), "rename"),
                      icon: richTextDocumentIcon,
                      label: "Rich Text Document",
                    },
                    {
                      action: () =>
                        newPath(NEW_TEXT_DOCUMENT, Buffer.from(""), "rename"),
                      icon: textDocumentIcon,
                      label: "Text Document",
                    },
                  ],
                },
              ]),
          ...(isDesktop
            ? [
                MENU_SEPERATOR,
                {
                  action: async () => {
                    if (!(await exists(INDEX_FILE))) {
                      const response = await fetch(document.location.href);
                      const buffer = Buffer.from(await response.arrayBuffer());

                      await writeFile(INDEX_FILE, buffer);

                      updateFolder(dirname(INDEX_FILE), basename(INDEX_FILE));
                    }

                    open("MonacoEditor", { url: INDEX_FILE });
                  },
                  label: "View page source",
                },
                {
                  action: () => open("DevTools", { url: "dom" }),
                  label: "Inspect",
                },
              ]
            : []),
        ];
      }),
    [
      addToFolder,
      canCapture,
      captureScreen,
      contextMenu,
      exists,
      hasWebGPU,
      isAscending,
      isDesktop,
      mapFs,
      newPath,
      open,
      pasteList,
      pasteToFolder,
      setWallpaper,
      sortBy,
      updateFolder,
      updateSorting,
      url,
      wallpaperImage,
      writeFile,
    ]
  );
};

export default useFolderContextMenu;
