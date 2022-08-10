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
import { basename, dirname, extname, join } from "path";
import { useCallback, useEffect, useState } from "react";
import { SAVE_PATH, TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";
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
    async (bundleUrl: string, closeInstance = false) => {
      const saveName = `${basename(bundleUrl)}${saveExtension}`;

      if (!(await exists(SAVE_PATH))) {
        await mkdirRecursive(SAVE_PATH);
        updateFolder(dirname(SAVE_PATH));
      }

      if (
        typeof dosCI[bundleUrl] !== "undefined" &&
        (await writeFile(
          join(SAVE_PATH, saveName),
          Buffer.from(await (dosCI[bundleUrl] as CommandInterface).persist()),
          true
        ))
      ) {
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
    const extension = extname(url).toLowerCase();
    const { zipAsync } = await import("utils/zipFunctions");
    const zipBuffer =
      extension !== ".exe"
        ? urlBuffer
        : Buffer.from(await zipAsync({ [basename(url)]: urlBuffer }));
    const bundleURL = bufferToUrl(
      extension === ".jsdos"
        ? zipBuffer
        : await addJsDosConfig(zipBuffer, readFile)
    );
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
        window.setTimeout(
          () => closeBundle(url, closing),
          TRANSITIONS_IN_MILLISECONDS.WINDOW
        );
      }
    };
  }, [closeBundle, closing, dosCI, dosInstance, loadBundle, process, url]);

  return dosCI[url];
};

export default useDosCI;
