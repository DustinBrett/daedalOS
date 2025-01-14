import { basename, join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BOOT_CD_FD_HD,
  BOOT_FD_CD_HD,
  config,
  saveExtension,
} from "components/apps/V86/config";
import { type V86ImageConfig, getImageType } from "components/apps/V86/image";
import {
  type NavigatorWithMemory,
  type V86Config,
  type V86Starter,
} from "components/apps/V86/types";
import useV86ScreenSize from "components/apps/V86/useV86ScreenSize";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { fs9pV4ToV3 } from "contexts/fileSystem/core";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { SAVE_PATH, TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  getExtension,
  getHtmlToImage,
  loadFiles,
} from "utils/functions";
import { useSnapshots } from "hooks/useSnapshots";

if (typeof window !== "undefined") {
  window.DEBUG = false;
}

const useV86 = ({
  containerRef,
  id,
  loading,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { foregroundId } = useSession();
  const { closing, libs = [] } = process || {};
  const { appendFileToTitle } = useTitle(id);
  const shutdown = useRef(false);
  const [emulator, setEmulator] = useState<
    Record<string, V86Starter | undefined>
  >({});
  const { exists, readFile } = useFileSystem();
  const saveStateAsync = useCallback(
    (diskImageUrl: string): Promise<ArrayBuffer> =>
      new Promise((resolve, reject) => {
        emulator[diskImageUrl]?.save_state().then(resolve).catch(reject);
      }),
    [emulator]
  );
  const { createSnapshot } = useSnapshots();
  const closeDiskImage = useCallback(
    async (diskImageUrl: string, screenshot?: Buffer): Promise<void> => {
      await createSnapshot(
        `${basename(diskImageUrl)}${saveExtension}`,
        Buffer.from(await saveStateAsync(diskImageUrl)),
        screenshot
      );

      try {
        emulator[diskImageUrl]?.destroy();
      } catch {
        // Ignore failures on destroy
      }
    },
    [createSnapshot, emulator, saveStateAsync]
  );
  const takeScreenshot = useCallback(
    async (fileUrl: string): Promise<Buffer | undefined> => {
      let screenshot: string | undefined;

      if (emulator[fileUrl]?.v86.cpu.devices.vga.graphical_mode) {
        screenshot = (
          containerRef.current?.querySelector("canvas") as HTMLCanvasElement
        )?.toDataURL("image/png");
      } else if (containerRef.current instanceof HTMLElement) {
        const htmlToImage = await getHtmlToImage();

        try {
          screenshot = await htmlToImage?.toPng(containerRef.current, {
            skipAutoScale: true,
          });
        } catch {
          // Ignore failure to capture
        }
      }

      return screenshot
        ? Buffer.from(
            screenshot.replace("data:image/png;base64,", ""),
            "base64"
          )
        : undefined;
    },
    [containerRef, emulator]
  );
  const loadDiskImage = useCallback(async () => {
    const [currentUrl] = Object.keys(emulator);

    if (typeof currentUrl === "string") {
      await closeDiskImage(currentUrl, await takeScreenshot(currentUrl));
      setEmulator({ [url]: undefined });
    }

    const imageContents = url ? await readFile(url) : Buffer.from("");
    const ext = getExtension(url);
    const isISO = ext === ".iso";
    const bufferUrl = bufferToUrl(imageContents);
    const v86ImageConfig: V86ImageConfig = {
      [isISO ? "cdrom" : getImageType(ext, imageContents.length)]: {
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
    takeScreenshot,
    url,
  ]);

  useV86ScreenSize(id, containerRef, emulator[url]);

  useEffect(() => {
    if (loading) {
      loadFiles(libs).then(() => {
        if (window.V86Starter) setLoading(false);
      });
    }
  }, [libs, loading, setLoading]);

  useEffect(() => {
    const isActiveInstance = foregroundId === id;

    Object.values(emulator).forEach((emulatorInstance) =>
      emulatorInstance?.keyboard_set_status(isActiveInstance)
    );
  }, [emulator, foregroundId, id]);

  useEffect(() => {
    if (process && !closing && !loading && !(url in emulator)) {
      loadDiskImage();
    }

    return () => {
      if (closing && !shutdown.current) {
        shutdown.current = true;

        if (url && emulator[url]) {
          const scheduleSaveState = (screenshot?: Buffer): void => {
            window.setTimeout(
              () => closeDiskImage(url, screenshot),
              TRANSITIONS_IN_MILLISECONDS.WINDOW
            );
          };

          takeScreenshot(url).then(scheduleSaveState).catch(scheduleSaveState);
        } else {
          emulator[url]?.destroy();
        }
      }
    };
  }, [
    closeDiskImage,
    closing,
    emulator,
    loadDiskImage,
    loading,
    process,
    takeScreenshot,
    url,
  ]);
};

export default useV86;
