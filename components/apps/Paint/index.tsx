import StyledPaint from "components/apps/Paint/StyledPaint";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import type { WallpaperFit } from "contexts/session/types";
import { basename, dirname, join } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DESKTOP_PATH, PICUTRES_PATH } from "utils/constants";

type JsPaint = {
  close: () => void;
  file_new: () => void;
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
  const {
    closeWithTransition,
    processes: { [id]: { libs: [paintSrc = ""] = [], url = "" } = {} } = {},
  } = useProcesses();
  const { createPath, exists, readFile, updateFolder, writeFile } =
    useFileSystem();
  const { setWallpaper } = useSession();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [jsPaintInstance, setJsPaintInstance] = useState<JsPaint>();
  const { prependFileToTitle } = useTitle(id);
  const setWallpaperFromCanvas = useCallback(
    (fit: WallpaperFit) =>
      (canvas: HTMLCanvasElement): void => {
        const wallpaperPath = join(PICUTRES_PATH, "wallpaper.png");

        canvas.toBlob(async (blob) => {
          await writeFile(
            wallpaperPath,
            Buffer.from((await blob?.arrayBuffer()) as ArrayBuffer),
            true
          );
          setWallpaper(wallpaperPath, fit);
        });
      },
    [setWallpaper, writeFile]
  );
  const { onDragOver, onDrop } = useFileDrop({ id });
  const style = useMemo(() => ({ opacity: loaded ? 1 : 0 }), [loaded]);

  useEffect(() => {
    prependFileToTitle("Untitled");
  }, [prependFileToTitle]);

  useEffect(() => {
    const { contentWindow } = iframeRef.current || {};

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
            Buffer.from(await (await getBlob("image/png")).arrayBuffer())
          )
        );
      jsPaint.systemHooks.writeBlobToHandle = async (fileHandle, blob) => {
        if (await exists(fileHandle)) {
          await writeFile(
            fileHandle,
            Buffer.from(await blob.arrayBuffer()),
            true
          );
          updateFolder(dirname(fileHandle), basename(fileHandle));
        }
      };

      contentWindow.addEventListener("dragover", onDragOver);
      contentWindow.addEventListener("drop", onDrop);
    }
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
        jsPaintInstance.open_from_file(new File([buffer], url), url);
        prependFileToTitle(basename(url));
      });
    }
  }, [jsPaintInstance, prependFileToTitle, readFile, url]);

  return (
    <StyledPaint>
      {!loaded && <StyledLoading className="loading" />}
      <iframe
        ref={iframeRef}
        height="100%"
        id="jspaint-iframe"
        onLoad={() => setLoaded(true)}
        src={paintSrc}
        style={style}
        title={id}
        width="100%"
      />
    </StyledPaint>
  );
};

export default Paint;
