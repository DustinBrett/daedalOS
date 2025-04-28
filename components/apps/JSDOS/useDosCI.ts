import { basename, join } from "path";
import { useCallback, useEffect, useState } from "react";
import { type DosInstance } from "emulators-ui/dist/types/js-dos";
import { type CommandInterface } from "emulators";
import {
  globals,
  saveExtension,
  zipConfigFiles,
} from "components/apps/JSDOS/config";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { SAVE_PATH, TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  getExtension,
  imgDataToBuffer,
} from "utils/functions";
import { cleanUpGlobals } from "utils/globals";
import { useSnapshots } from "hooks/useSnapshots";

const addJsDosConfig = async (
  buffer: Buffer,
  readFile: (path: string) => Promise<Buffer>
): Promise<Buffer> => {
  const { addFileToZip, isFileInZip } = await import("utils/zipFunctions");

  return Object.entries(zipConfigFiles).reduce(
    async (newBuffer, [zipPath, fsPath]) => {
      const currentZip = await newBuffer;

      return currentZip.length > 0 && (await isFileInZip(currentZip, zipPath))
        ? currentZip
        : addFileToZip(currentZip, fsPath, zipPath, readFile);
    },
    Promise.resolve(buffer)
  );
};

const useDosCI = (
  id: string,
  url: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
  dosInstance?: DosInstance
): CommandInterface | undefined => {
  const { appendFileToTitle } = useTitle(id);
  const { exists, readFile } = useFileSystem();
  const {
    argument,
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { closing } = process || {};
  const [dosCI, setDosCI] = useState<
    Record<string, CommandInterface | undefined>
  >({});
  const { createSnapshot } = useSnapshots();
  const closeBundle = useCallback(
    async (bundleUrl: string, screenshot?: Buffer, closeInstance = false) => {
      if (dosCI[bundleUrl]) {
        await createSnapshot(
          `${basename(bundleUrl)}${saveExtension}`,
          Buffer.from(((await dosCI[bundleUrl].persist()) as Uint8Array) || []),
          screenshot
        );
      }

      if (closeInstance) {
        try {
          await dosInstance?.stop();
          await dosCI[bundleUrl]?.exit();
        } catch {
          // Ignore errors during closing
        }
      }
    },
    [createSnapshot, dosCI, dosInstance]
  );
  const takeScreenshot = useCallback(
    async (fileUrl: string): Promise<Buffer | undefined> => {
      const imageData = await dosCI[fileUrl]?.screenshot();

      return imageData ? imgDataToBuffer(imageData) : undefined;
    },
    [dosCI]
  );
  const loadBundle = useCallback(async () => {
    const [currentUrl] = Object.keys(dosCI);

    if (typeof currentUrl === "string") {
      await closeBundle(currentUrl, await takeScreenshot(currentUrl));
      setDosCI({ [url]: undefined });
    }

    const urlBuffer = url ? await readFile(url) : Buffer.from("");
    const extension = getExtension(url);
    const { zipAsync } = await import("utils/zipFunctions");
    const zippedPayload = async (buffer: Buffer): Promise<Buffer> =>
      Buffer.from(await zipAsync({ [basename(url)]: buffer }));
    const zipBufferToUrl = async (buffer: Buffer): Promise<string> =>
      bufferToUrl(await addJsDosConfig(buffer, readFile));
    const zipBuffer =
      extension === ".exe" ? await zippedPayload(urlBuffer) : urlBuffer;
    let bundleURL: string;

    if (extension === ".jsdos") {
      bundleURL = bufferToUrl(zipBuffer);
    } else {
      try {
        bundleURL = await zipBufferToUrl(zipBuffer);
      } catch {
        bundleURL = await zipBufferToUrl(await zippedPayload(urlBuffer));
      }
    }

    const savePath = join(SAVE_PATH, `${basename(url)}${saveExtension}`);
    const stateUrl = (await exists(savePath))
      ? bufferToUrl(await readFile(savePath))
      : undefined;
    const ci = await dosInstance?.run(bundleURL, stateUrl);

    if (ci) {
      const canvas = containerRef.current?.querySelector("canvas");

      if (canvas instanceof HTMLCanvasElement) {
        linkElement(id, "peekElement", canvas);
        setDosCI({ [url]: ci });
        appendFileToTitle(basename(url));
        argument(id, "mute", () => {
          ci.mute();
          argument(id, "muted", true);
        });
        argument(id, "unmute", () => {
          ci.unmute();
          argument(id, "muted", false);
        });
        cleanUpBufferUrl(bundleURL);
        if (stateUrl) cleanUpBufferUrl(stateUrl);
        cleanUpGlobals(globals);
      }
    }
  }, [
    appendFileToTitle,
    argument,
    closeBundle,
    containerRef,
    dosCI,
    dosInstance,
    exists,
    id,
    linkElement,
    readFile,
    takeScreenshot,
    url,
  ]);

  useEffect(() => {
    if (process && !closing && dosInstance && !(url in dosCI)) {
      loadBundle();
    }

    return () => {
      if (closing) {
        if (url) {
          const scheduleSaveState = (screenshot?: Buffer): void => {
            window.setTimeout(
              () => closeBundle(url, screenshot, closing),
              TRANSITIONS_IN_MILLISECONDS.WINDOW
            );
          };

          takeScreenshot(url).then(scheduleSaveState).catch(scheduleSaveState);
        } else {
          dosInstance?.stop();
        }
      }
    };
  }, [
    closeBundle,
    closing,
    dosCI,
    dosInstance,
    loadBundle,
    process,
    takeScreenshot,
    url,
  ]);

  return dosCI[url];
};

export default useDosCI;
