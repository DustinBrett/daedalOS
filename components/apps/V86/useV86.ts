import {
  BOOT_CD_FD_HD,
  BOOT_FD_CD_HD,
  config,
  libs,
  saveExtension,
} from "components/apps/V86/config";
import type { V86ImageConfig } from "components/apps/V86/image";
import { getImageType } from "components/apps/V86/image";
import type {
  NavigatorWithMemory,
  V86Config,
  V86Starter,
} from "components/apps/V86/types";
import useV86ScreenSize from "components/apps/V86/useV86ScreenSize";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { fs9pV4ToV3 } from "contexts/fileSystem/functions";
import { useProcesses } from "contexts/process";
import { basename, dirname, extname, join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { SAVE_PATH } from "utils/constants";
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

      if (!(await exists(SAVE_PATH))) {
        await mkdirRecursive(SAVE_PATH);
        updateFolder(dirname(SAVE_PATH));
      }

      if (
        await writeFile(
          join(SAVE_PATH, saveName),
          Buffer.from(await saveStateAsync(diskImageUrl)),
          true
        )
      ) {
        try {
          emulator[diskImageUrl]?.destroy();
        } catch {
          // Ignore failures on destroy
        } finally {
          updateFolder(SAVE_PATH, saveName);
        }
      }
    },
    [emulator, exists, mkdirRecursive, saveStateAsync, updateFolder, writeFile]
  );
  const loadDiskImage = useCallback(async () => {
    const [currentUrl] = Object.keys(emulator);

    if (currentUrl) await closeDiskImage(currentUrl);

    const imageContents = url ? await readFile(url) : Buffer.from("");
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
    const { deviceMemory = 0.25 } = navigator as NavigatorWithMemory;
    const v86StarterConfig: V86Config = {
      boot_order: isISO ? BOOT_CD_FD_HD : BOOT_FD_CD_HD,
      memory_size: deviceMemory * 128 * 1024 * 1024,
      screen_container: containerRef.current,
      vga_memory_size: deviceMemory * 8 * 1024 * 1024,
      ...v86ImageConfig,
      ...config,
    };
    const savePath = join(SAVE_PATH, `${basename(url)}${saveExtension}`);
    const saveContents = (await exists(savePath))
      ? bufferToUrl(await readFile(savePath))
      : undefined;

    if (saveContents) v86StarterConfig.initial_state = { url: saveContents };

    v86StarterConfig.filesystem = {
      basefs: URL.createObjectURL(
        new Blob([JSON.stringify(fs9pV4ToV3())], { type: "application/json" })
      ),
      baseurl: window.location?.origin ?? "/",
    };

    const v86 = new window.V86Starter(v86StarterConfig);

    v86.add_listener("emulator-loaded", () => {
      if (shutdown.current) {
        v86.destroy();
        return;
      }

      appendFileToTitle(basename(url));
      cleanUpBufferUrl(bufferUrl);

      if (v86StarterConfig.initial_state) {
        cleanUpBufferUrl(v86StarterConfig.initial_state.url);
      }

      if (v86StarterConfig.filesystem) {
        cleanUpBufferUrl(v86StarterConfig.filesystem.basefs);
      }

      containerRef.current?.addEventListener("click", v86.lock_mouse);

      setEmulator({ [url]: v86 });
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
        if (window.V86Starter) setLoading(false);
      });
    }
  }, [loading, setLoading]);

  useEffect(() => {
    if (process && !closing && !loading && !(url in emulator)) {
      setEmulator({ [url]: undefined });
      loadDiskImage();
    }

    return () => {
      if (url && closing && !shutdown.current) {
        shutdown.current = true;
        if (emulator[url]) {
          window.requestIdleCallback(() => closeDiskImage(url), {
            timeout: 1000,
          });
        }
      }
    };
  }, [closeDiskImage, closing, emulator, loadDiskImage, loading, process, url]);
};

export default useV86;
