import { basename, dirname, join } from "path";
import { useCallback, useMemo } from "react";
import { WALLPAPER_MENU } from "components/system/Desktop/Wallpapers/constants";
import { getIconByFileExtension } from "components/system/Files/FileEntry/functions";
import { type FolderActions } from "components/system/Files/FileManager/useFolder";
import {
  type SortBy,
  type SortByOrder,
} from "components/system/Files/FileManager/useSortBy";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import {
  type CaptureTriggerEvent,
  type ContextMenuCapture,
  type MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useProcessesRef } from "hooks/useProcessesRef";
import { useWebGPUCheck } from "hooks/useWebGPUCheck";
import {
  DESKTOP_PATH,
  FOLDER_ICON,
  INDEX_FILE,
  MENU_SEPERATOR,
  MOUNTABLE_EXTENSIONS,
  PROCESS_DELIMITER,
} from "utils/constants";
import {
  blobToBuffer,
  bufferToBlob,
  generatePrettyTimestamp,
  getExtension,
  isFileSystemMappingSupported,
  isFirefox,
  isSafari,
  updateIconPositions,
} from "utils/functions";
import { getMountUrl, isMountedFolder } from "contexts/fileSystem/core";

const stopGlobalMusicVisualization = (): void => {
  window.WebampGlobal?.store.dispatch({
    enabled: false,
    type: "SET_MILKDROP_DESKTOP",
  });
};

const NEW_FOLDER = "New folder";
const NEW_TEXT_DOCUMENT = "New Text Document.txt";
const NEW_RTF_DOCUMENT = "New Rich Text Document.whtml";

const updateSortBy =
  (value: SortBy, defaultIsAscending: boolean) =>
  ([sortBy, isAscending]: SortByOrder): SortByOrder => [
    value,
    sortBy === value ? !isAscending : defaultIsAscending,
  ];

const CAPTURE_FPS = 30;
const MIME_TYPE_VIDEO_WEBM = "video/webm";
const MIME_TYPE_VIDEO_MP4 = "video/mp4";

let currentMediaStream: MediaStream | undefined;
let currentMediaRecorder: MediaRecorder | undefined;

const useFolderContextMenu = (
  url: string,
  {
    addToFolder,
    newPath,
    pasteToFolder,
    sortByOrder: [[sortBy, isAscending], setSortBy],
  }: FolderActions,
  isDesktop?: boolean,
  isStartMenu?: boolean
): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const {
    exists,
    mapFs,
    pasteList = {},
    readFile,
    rootFs,
    writeFile,
    updateFolder,
  } = useFileSystem();
  const {
    iconPositions,
    setForegroundId,
    setWallpaper: setSessionWallpaper,
    setIconPositions,
    sortOrders,
    updateRecentFiles,
    wallpaperImage,
  } = useSession();
  const { minimize, open } = useProcesses();
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
        window?.MediaRecorder?.isTypeSupported(MIME_TYPE_VIDEO_MP4)),
    [isDesktop]
  );
  const captureScreen = useCallback(async () => {
    if (currentMediaRecorder && currentMediaStream) {
      const { active: wasActive } = currentMediaStream;

      try {
        currentMediaRecorder.requestData();
        currentMediaStream.getTracks().forEach((track) => track.stop());
      } catch {
        // Ignore errors with MediaRecorder
      }

      currentMediaRecorder = undefined;
      currentMediaStream = undefined;

      if (wasActive) return;
    }

    const isFirefoxOrSafari = isFirefox() || isSafari();
    const displayMediaOptions: DisplayMediaStreamOptions &
      MediaStreamConstraints = {
      video: {
        frameRate: CAPTURE_FPS,
      },
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#browser_compatibility
      ...(!isFirefoxOrSafari && {
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
        systemAudio: "include",
      }),
    };

    currentMediaStream =
      await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

    const [currentVideoTrack] = currentMediaStream.getVideoTracks();
    const { height, width } = currentVideoTrack.getSettings();
    const supportsWebm = MediaRecorder.isTypeSupported(MIME_TYPE_VIDEO_WEBM);
    const fileName = `Screen Capture ${generatePrettyTimestamp()}.${
      supportsWebm ? "webm" : "mp4"
    }`;

    currentMediaRecorder = new MediaRecorder(currentMediaStream, {
      bitsPerSecond: height && width ? height * width * CAPTURE_FPS : undefined,
      mimeType: supportsWebm ? MIME_TYPE_VIDEO_WEBM : MIME_TYPE_VIDEO_MP4,
    });

    const capturePath = join(DESKTOP_PATH, fileName);
    const startTime = Date.now();
    let hasCapturedData = false;

    currentMediaRecorder.start();
    currentMediaRecorder.addEventListener("dataavailable", async (event) => {
      const { data } = event;

      if (data?.size) {
        const bufferData = await blobToBuffer(data);

        await writeFile(
          capturePath,
          hasCapturedData
            ? Buffer.concat([await readFile(capturePath), bufferData])
            : bufferData,
          hasCapturedData
        );

        if (
          supportsWebm &&
          !isFirefoxOrSafari &&
          (!currentMediaRecorder || currentMediaRecorder.state === "inactive")
        ) {
          const { default: fixWebmDuration } = await import(
            "fix-webm-duration"
          );

          fixWebmDuration(
            bufferToBlob(await readFile(capturePath)),
            Date.now() - startTime,
            async (capturedFile) => {
              await writeFile(
                capturePath,
                await blobToBuffer(capturedFile),
                true
              );
              updateFolder(DESKTOP_PATH, fileName);
            }
          );
        } else {
          updateFolder(DESKTOP_PATH, fileName);
        }

        hasCapturedData = true;
      }
    });
  }, [readFile, updateFolder, writeFile]);
  const hasWebGPU = useWebGPUCheck();
  const processesRef = useProcessesRef();
  const updateDesktopIconPositions = useCallback(
    (names: string[], event?: CaptureTriggerEvent) => {
      if (event && isDesktop) {
        const { clientX: x, clientY: y } =
          "TouchEvent" in window && event.nativeEvent instanceof TouchEvent
            ? event.nativeEvent.touches[0]
            : (event.nativeEvent as MouseEvent);

        updateIconPositions(
          DESKTOP_PATH,
          event.target as HTMLElement,
          iconPositions,
          sortOrders,
          { x, y },
          names,
          setIconPositions,
          exists
        );
      }
    },
    [exists, iconPositions, isDesktop, setIconPositions, sortOrders]
  );
  const newEntry = useCallback(
    async (
      entryName: string,
      data?: Buffer,
      event?: CaptureTriggerEvent
    ): Promise<string> =>
      newPath(entryName, data, "rename", (name) =>
        updateDesktopIconPositions([name], event)
      ),
    [newPath, updateDesktopIconPositions]
  );

  return useMemo(
    () =>
      contextMenu?.((event) => {
        const { offsetX, offsetY, target } = (event as React.MouseEvent)
          .nativeEvent;
        const targetElement = target as HTMLElement;

        if (!isDesktop && !isStartMenu && offsetX > targetElement.clientWidth) {
          const SCROLL_BUTTON_HEIGHT = 17;
          const SCROLL_ITERATION_HEIGHT = 44;

          return [
            {
              action: () => {
                let top = 0;

                if (
                  offsetY >
                  targetElement.clientHeight - SCROLL_BUTTON_HEIGHT
                ) {
                  top = targetElement.scrollHeight;
                } else if (offsetY > SCROLL_BUTTON_HEIGHT) {
                  const scrollBarButtonsHeight = SCROLL_BUTTON_HEIGHT * 2;

                  top = Math.round(
                    (targetElement.scrollHeight *
                      (offsetY - scrollBarButtonsHeight)) /
                      (targetElement.clientHeight - scrollBarButtonsHeight)
                  );
                }

                targetElement.scrollTo({
                  behavior: "instant",
                  top,
                });
              },
              label: "Scroll Here",
            },
            MENU_SEPERATOR,
            {
              action: () => {
                targetElement.scrollTo({
                  behavior: "instant",
                  top: 0,
                });
              },
              label: "Top",
            },
            {
              action: () => {
                targetElement.scrollTo({
                  behavior: "instant",
                  top: targetElement.scrollHeight,
                });
              },
              label: "Bottom",
            },
            MENU_SEPERATOR,
            {
              action: () => {
                targetElement.scrollBy({
                  behavior: "instant",
                  top: -targetElement.clientHeight,
                });
              },
              label: "Page Up",
            },
            {
              action: () => {
                targetElement.scrollBy({
                  behavior: "instant",
                  top: targetElement.clientHeight,
                });
              },
              label: "Page Down",
            },
            MENU_SEPERATOR,
            {
              action: () => {
                targetElement.scrollBy({
                  behavior: "instant",
                  top: -SCROLL_ITERATION_HEIGHT,
                });
              },
              label: "Scroll Up",
            },
            {
              action: () => {
                targetElement.scrollBy({
                  behavior: "instant",
                  top: SCROLL_ITERATION_HEIGHT,
                });
              },
              label: "Scroll Down",
            },
          ];
        }

        const ADD_FILE = {
          action: () =>
            addToFolder().then((files) =>
              updateDesktopIconPositions(files, event)
            ),
          label: "Add file(s)",
        };
        const MAP_DIRECTORY = {
          action: () =>
            mapFs(url)
              .then((mappedFolder) => {
                updateDesktopIconPositions([mappedFolder], event);
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
        const mountUrl = getMountUrl(url, rootFs?.mntMap || {});
        const isReadOnly =
          MOUNTABLE_EXTENSIONS.has(getExtension(url)) ||
          (mountUrl && !isMountedFolder(rootFs?.mntMap[mountUrl]));
        const hasCustomOrder =
          isDesktop &&
          Object.keys(iconPositions).some(
            (entryPath) => dirname(entryPath) === url
          );

        return [
          {
            label: "Sort by",
            menu: [
              {
                action: () => updateSorting("name", true),
                label: "Name",
                toggle: !hasCustomOrder && sortBy === "name",
              },
              {
                action: () => updateSorting("size", false),
                label: "Size",
                toggle: !hasCustomOrder && sortBy === "size",
              },
              {
                action: () => updateSorting("type", true),
                label: "Item type",
                toggle: !hasCustomOrder && sortBy === "type",
              },
              {
                action: () => updateSorting("date", false),
                label: "Date modified",
                toggle: !hasCustomOrder && sortBy === "date",
              },
              ...(hasCustomOrder
                ? []
                : [
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
                  ]),
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
                    (menu, { hasAlt = true, id, name }) => [
                      ...menu,
                      {
                        action: () => {
                          if (isMusicVisualizationRunning) {
                            stopGlobalMusicVisualization();
                          }
                          setSessionWallpaper(
                            `${id}${
                              hasAlt &&
                              wallpaperImage.startsWith(id) &&
                              !wallpaperImage.endsWith(" ALT")
                                ? " ALT"
                                : ""
                            }`
                          );
                        },
                        label: name || id,
                        toggle: hasAlt
                          ? wallpaperImage.startsWith(id)
                          : wallpaperImage === id,
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
                MENU_SEPERATOR,
                {
                  action: () => pasteToFolder(event),
                  disabled: Object.keys(pasteList).length === 0,
                  label: "Paste",
                },
                MENU_SEPERATOR,
                {
                  label: "New",
                  menu: [
                    {
                      action: () => newEntry(NEW_FOLDER, undefined, event),
                      icon: FOLDER_ICON,
                      label: "Folder",
                    },
                    MENU_SEPERATOR,
                    {
                      action: () =>
                        newEntry(NEW_RTF_DOCUMENT, Buffer.from(""), event),
                      icon: getIconByFileExtension(".whtml"),
                      label: "Rich Text Document",
                    },
                    {
                      action: () =>
                        newEntry(NEW_TEXT_DOCUMENT, Buffer.from(""), event),
                      icon: getIconByFileExtension(".txt"),
                      label: "Text Document",
                    },
                  ],
                },
                ...(isDesktop
                  ? []
                  : [
                      MENU_SEPERATOR,
                      {
                        action: () => {
                          const activePid = Object.keys(
                            processesRef.current
                          ).find(
                            (p) => p === `Properties${PROCESS_DELIMITER}${url}`
                          );

                          if (activePid) {
                            if (processesRef.current[activePid].minimized) {
                              minimize(activePid);
                            }

                            setForegroundId(activePid);
                          } else {
                            open("Properties", { url });
                          }
                        },
                        label: "Properties",
                      },
                    ]),
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
                    updateRecentFiles(INDEX_FILE, "MonacoEditor");
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
      iconPositions,
      isAscending,
      isDesktop,
      isStartMenu,
      mapFs,
      minimize,
      newEntry,
      open,
      pasteList,
      pasteToFolder,
      processesRef,
      rootFs?.mntMap,
      setForegroundId,
      setSessionWallpaper,
      sortBy,
      updateDesktopIconPositions,
      updateFolder,
      updateRecentFiles,
      updateSorting,
      url,
      wallpaperImage,
      writeFile,
    ]
  );
};

export default useFolderContextMenu;
