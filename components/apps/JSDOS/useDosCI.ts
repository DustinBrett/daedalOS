import {
  globals,
  saveExtension,
  zipConfigFiles,
} from "components/apps/JSDOS/config";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import type { CommandInterface } from "emulators";
import type { DosInstance } from "emulators-ui/dist/types/js-dos";
import { basename, dirname, join } from "path";
import { useCallback, useEffect, useState } from "react";
import {
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  SAVE_PATH,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  getExtension,
  imgDataToBuffer,
} from "utils/functions";
import { cleanUpGlobals } from "utils/globals";

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
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  dosInstance?: DosInstance
): CommandInterface | undefined => {
  const { appendFileToTitle } = useTitle(id);
  const { exists, mkdirRecursive, readFile, updateFolder, writeFile } =
    useFileSystem();
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { closing } = process || {};
  const [dosCI, setDosCI] = useState<
    Record<string, CommandInterface | undefined>
  >({});
  const closeBundle = useCallback(
    async (bundleUrl: string, screenshot?: Buffer, closeInstance = false) => {
      const saveName = `${basename(bundleUrl)}${saveExtension}`;

      if (!(await exists(SAVE_PATH))) {
        await mkdirRecursive(SAVE_PATH);
        updateFolder(dirname(SAVE_PATH));
      }

      const savePath = join(SAVE_PATH, saveName);

      if (
        dosCI[bundleUrl] !== undefined &&
        (await writeFile(
          savePath,
          Buffer.from(await (dosCI[bundleUrl] as CommandInterface).persist()),
          true
        ))
      ) {
        if (screenshot) {
          const iconCacheRootPath = join(ICON_CACHE, SAVE_PATH);
          const iconCachePath = join(
            ICON_CACHE,
            `${savePath}${ICON_CACHE_EXTENSION}`
          );

          if (!(await exists(iconCacheRootPath))) {
            await mkdirRecursive(iconCacheRootPath);
            updateFolder(dirname(SAVE_PATH));
          }

          await writeFile(iconCachePath, screenshot, true);
        }

        if (closeInstance) dosInstance?.stop();
        updateFolder(SAVE_PATH, saveName);
      }
    },
    [dosCI, dosInstance, exists, mkdirRecursive, updateFolder, writeFile]
  );
  const loadBundle = useCallback(async () => {
    const [currentUrl] = Object.keys(dosCI);

    if (currentUrl) closeBundle(currentUrl);

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
        cleanUpBufferUrl(bundleURL);
        if (stateUrl) cleanUpBufferUrl(stateUrl);
        cleanUpGlobals(globals);
      }
    }
  }, [
    appendFileToTitle,
    closeBundle,
    containerRef,
    dosCI,
    dosInstance,
    exists,
    id,
    linkElement,
    readFile,
    url,
  ]);

  useEffect(() => {
    if (process && !closing && dosInstance && !(url in dosCI)) {
      setDosCI({ [url]: undefined });
      loadBundle();
    }

    return () => {
      if (url && closing) {
        const takeScreenshot = async (): Promise<Buffer | undefined> => {
          const imageData = await dosCI[url]?.screenshot();

          return imageData ? imgDataToBuffer(imageData) : undefined;
        };
        const scheduleSaveState = (screenshot?: Buffer): void => {
          window.setTimeout(
            () => closeBundle(url, screenshot, closing),
            TRANSITIONS_IN_MILLISECONDS.WINDOW
          );
        };

        takeScreenshot().then(scheduleSaveState).catch(scheduleSaveState);
      }
    };
  }, [closeBundle, closing, dosCI, dosInstance, loadBundle, process, url]);

  return dosCI[url];
};

export default useDosCI;
