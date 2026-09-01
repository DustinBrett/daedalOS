import { basename, dirname, join } from "path";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import StyledPaint from "components/apps/Paint/StyledPaint";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Apps/StyledLoading";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import { useForegroundId, useSessionActions } from "contexts/session";
import { type WallpaperFit } from "contexts/session/types";
import {
  DESKTOP_PATH,
  IFRAME_CONFIG,
  ONE_TIME_PASSIVE_EVENT,
  PICUTRES_PATH,
} from "utils/constants";
import { blobToBuffer } from "utils/functions";

type JsPaint = {
  close: () => void;
  file_new: () => void;
  onunhandledrejection: (
    error: Error & { reason: { message: string } }
  ) => void;
  open_from_file: (file: File, fileHandle: string) => void;
  storage_quota_exceeded: () => void;
  systemHooks: {
    setWallpaperCentered: (canvas: HTMLCanvasElement) => void;
    setWallpaperTiled: (canvas: HTMLCanvasElement) => void;
    showOpenFileDialog: (props: {
      formats: unknown[];
    }) => Promise<{ file: File }>;
    showSaveFileDialog: (props: {
      defaultFileName: string;
      getBlob: (mimeType: string) => Promise<Blob>;
    }) => void;
    writeBlobToHandle: (fileHandle: string, blob: Blob) => Promise<void>;
  };
};

const Paint: FC<ComponentProcessProps> = ({ id }) => {
  const { closeWithTransition } = useProcessesActions();
  const { libs: [paintSrc = ""] = [], url = "" } = useProcess(id);
  const { createPath, exists, readFile, updateFolder, writeFile } =
    useFileSystemActions();
  const { setForegroundId, setWallpaper } = useSessionActions();
  const foregroundId = useForegroundId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [jsPaintInstance, setJsPaintInstance] = useState<JsPaint>();
  const { prependFileToTitle } = useTitle(id);
  const setWallpaperFromCanvas = useCallback(
    (fit: WallpaperFit) =>
      (canvas: HTMLCanvasElement): void => {
        const wallpaperPath = join(PICUTRES_PATH, "wallpaper.png");

        canvas.toBlob(async (blob) => {
          await writeFile(wallpaperPath, await blobToBuffer(blob), true);
          setWallpaper(wallpaperPath, fit);
        });
      },
    [setWallpaper, writeFile]
  );
  const { onDragOver, onDrop } = useFileDrop({ id });

  useEffect(() => {
    prependFileToTitle("Untitled");
  }, [prependFileToTitle]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (foregroundId !== id) {
      const onClick = (): void => setForegroundId(id);
      const contentWindow = iframeRef.current?.contentWindow;

      contentWindow?.addEventListener("click", onClick, ONE_TIME_PASSIVE_EVENT);

      cleanup = () => contentWindow?.removeEventListener("click", onClick);
    }

    return cleanup;
  }, [foregroundId, id, setForegroundId]);

  useEffect(() => {
    const { contentWindow } = iframeRef.current || {};
    let cleanup: (() => void) | undefined;

    if (loaded && contentWindow && !jsPaintInstance) {
      const jsPaint = contentWindow as unknown as JsPaint;
      const previousOpenFileDialog = jsPaint.systemHooks.showOpenFileDialog;
      const previousFileNew = jsPaint.file_new;

      setJsPaintInstance(jsPaint);

      jsPaint.file_new = () => {
        prependFileToTitle("Untitled");
        previousFileNew();
      };
      jsPaint.systemHooks.setWallpaperTiled = setWallpaperFromCanvas("tile");
      jsPaint.systemHooks.setWallpaperCentered =
        setWallpaperFromCanvas("center");
      jsPaint.systemHooks.showOpenFileDialog = async (props) => {
        const { file } = await previousOpenFileDialog(props);

        prependFileToTitle(file.name);

        return { file };
      };
      jsPaint.close = () => closeWithTransition(id);
      jsPaint.storage_quota_exceeded = () => {
        // Ignore Storage Warning
      };
      jsPaint.systemHooks.showSaveFileDialog = async ({
        defaultFileName,
        getBlob,
      }) =>
        updateFolder(
          DESKTOP_PATH,
          await createPath(
            `${defaultFileName}.png`,
            DESKTOP_PATH,
            await blobToBuffer(await getBlob("image/png"))
          )
        );
      jsPaint.systemHooks.writeBlobToHandle = async (fileHandle, blob) => {
        if (await exists(fileHandle)) {
          await writeFile(fileHandle, await blobToBuffer(blob), true);
          updateFolder(dirname(fileHandle), basename(fileHandle));
        }
      };

      contentWindow.addEventListener("dragover", onDragOver);
      contentWindow.addEventListener("drop", onDrop);

      cleanup = () => {
        contentWindow.removeEventListener("dragover", onDragOver);
        contentWindow.removeEventListener("drop", onDrop);
      };
    }

    return cleanup;
  }, [
    closeWithTransition,
    createPath,
    exists,
    id,
    jsPaintInstance,
    loaded,
    onDragOver,
    onDrop,
    prependFileToTitle,
    setWallpaperFromCanvas,
    updateFolder,
    writeFile,
  ]);

  useEffect(() => {
    if (jsPaintInstance && url) {
      readFile(url).then((buffer) => {
        // eslint-disable-next-line prefer-destructuring
        const onunhandledrejection = jsPaintInstance.onunhandledrejection;

        jsPaintInstance.onunhandledrejection = (error) => {
          onunhandledrejection?.(error);

          if (
            error?.reason?.message ===
            "either options.data or options.file or options.filePath must be passed"
          ) {
            prependFileToTitle("Untitled");
          }
        };
        jsPaintInstance.open_from_file(
          new File([buffer as BlobPart], url),
          url
        );
        prependFileToTitle(basename(url));
      });
    }
  }, [jsPaintInstance, prependFileToTitle, readFile, url]);

  return (
    <StyledPaint $loaded={loaded}>
      {!loaded && <StyledLoading className="loading" />}
      {paintSrc && (
        <iframe
          ref={iframeRef}
          // Busy on the content only, never on an ancestor of the
          // role="status" loader or its announcement may be withheld
          aria-busy={!loaded || undefined}
          height="100%"
          id={`jspaint-${id}`}
          onLoad={() => setLoaded(true)}
          src={paintSrc}
          title={id}
          width="100%"
          {...IFRAME_CONFIG}
        />
      )}
    </StyledPaint>
  );
};

export default memo(Paint);
