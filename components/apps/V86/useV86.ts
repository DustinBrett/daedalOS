import {
  BOOT_CD_FD_HD,
  BOOT_FD_CD_HD,
  config,
  libs,
  saveExtension,
} from "components/apps/V86/config";
import type { V86ImageConfig } from "components/apps/V86/image";
import { getImageType } from "components/apps/V86/image";
import type { V86Config, V86Starter } from "components/apps/V86/types";
import useV86ScreenSize from "components/apps/V86/useV86ScreenSize";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname, join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_BUFFER, SAVE_PATH } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl, loadFiles } from "utils/functions";

const useV86 = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { closing } = process || {};
  const { appendFileToTitle } = useTitle(id);
  const shutdown = useRef(false);
  const [emulator, setEmulator] = useState<
    Record<string, V86Starter | undefined>
  >({});
  const { exists, mkdirRecursive, readFile, updateFolder, writeFile } =
    useFileSystem();
  const saveStateAsync = useCallback(
    (diskImageUrl: string): Promise<ArrayBuffer> =>
      new Promise((resolve, reject) => {
        emulator[diskImageUrl]?.save_state((error, state) =>
          error ? reject(error) : resolve(state)
        );
      }),
    [emulator]
  );
  const closeDiskImage = useCallback(
    async (diskImageUrl: string): Promise<void> => {
      const saveName = `${basename(diskImageUrl)}${saveExtension}`;

      if (!(await exists(SAVE_PATH))) await mkdirRecursive(SAVE_PATH);

      if (
        await writeFile(
          join(SAVE_PATH, saveName),
          Buffer.from(new Uint8Array(await saveStateAsync(diskImageUrl))),
          true
        )
      ) {
        emulator[diskImageUrl]?.destroy();
        updateFolder(SAVE_PATH, saveName);
      }
    },
    [emulator, exists, mkdirRecursive, saveStateAsync, updateFolder, writeFile]
  );
  const loadDiskImage = useCallback(async () => {
    const [currentUrl] = Object.keys(emulator);

    if (currentUrl) await closeDiskImage(currentUrl);

    const imageContents = url ? await readFile(url) : EMPTY_BUFFER;
    const isISO = extname(url).toLowerCase() === ".iso";
    const bufferUrl = bufferToUrl(imageContents);
    const v86ImageConfig: V86ImageConfig = {
      [isISO ? "cdrom" : getImageType(imageContents.length)]: {
        async: false,
        size: imageContents.length,
        url: bufferUrl,
        use_parts: false,
      },
    };
    const v86StarterConfig: V86Config = {
      boot_order: isISO ? BOOT_CD_FD_HD : BOOT_FD_CD_HD,
      screen_container: containerRef.current,
      ...v86ImageConfig,
      ...config,
    };
    const savePath = join(SAVE_PATH, `${basename(url)}${saveExtension}`);
    const saveContents =
      url && (await exists(savePath))
        ? bufferToUrl(await readFile(savePath))
        : undefined;

    if (saveContents) v86StarterConfig.initial_state = { url: saveContents };

    const v86 = new window.V86Starter(v86StarterConfig);

    v86.add_listener("emulator-loaded", () => {
      if (shutdown.current) {
        v86?.destroy();
      } else {
        appendFileToTitle(basename(url));
        cleanUpBufferUrl(bufferUrl);

        if (v86StarterConfig.initial_state) {
          cleanUpBufferUrl(v86StarterConfig.initial_state.url);
        }

        containerRef.current?.addEventListener("click", v86.lock_mouse);

        setEmulator({ [url]: v86 });
      }
    });
  }, [
    appendFileToTitle,
    closeDiskImage,
    containerRef,
    emulator,
    exists,
    readFile,
    url,
  ]);

  useV86ScreenSize(id, containerRef, emulator[url]);

  useEffect(() => {
    if (loading) {
      loadFiles(libs).then(() => {
        if (window.V86Starter) {
          window.DEBUG = false;
          setLoading(false);
        }
      });
    }
  }, [loading, setLoading]);

  useEffect(() => {
    if (process && !closing && !loading && !(url in emulator)) {
      setEmulator({ [url]: undefined });
      loadDiskImage();
    }

    return () => {
      if (url && closing) {
        shutdown.current = true;
        if (emulator[url]) closeDiskImage(url);
      }
    };
  }, [closeDiskImage, closing, emulator, loadDiskImage, loading, process, url]);
};

export default useV86;
