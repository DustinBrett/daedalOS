import { useFileSystem } from "contexts/fileSystem";
import { useMemo } from "react";
import { getExtension } from "utils/functions";
import type { Unzipped } from "utils/zipFunctions";
import { unarchive, unzip } from "utils/zipFunctions";
import { useAsync } from "./useAsync";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const useFile = (path: string): [Buffer | undefined, any] => {
  const { readFile } = useFileSystem();
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
  const [fileContent, error] = useAsync(async () => {
    /* eslint-disable-next-line unicorn/no-useless-undefined */
    if (!path) return undefined;
    return readFile(path);
  }, [path, readFile]);
  return [fileContent, error];
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const useFileAsString = (path: string): [string | undefined, any] => {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
  const [fileContent, error] = useFile(path);
  const fileContentString = useMemo(() => {
    /* eslint-disable-next-line unicorn/no-useless-undefined */
    if (!fileContent) return undefined;
    return fileContent.toString();
  }, [fileContent]);
  return [fileContentString, error];
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const useZip = (path: string): [Unzipped | undefined, any] => {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
  const [zipContent, fileError] = useFile(path);
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
  const [unzippedFiles, zipError] = useAsync(async () => {
    /* eslint-disable-next-line unicorn/no-useless-undefined */
    if (!zipContent) return undefined;
    return [".jsdos", ".wsz", ".zip"].includes(getExtension(path))
      ? unzip(zipContent)
      : unarchive(path, zipContent);
  }, [path, zipContent]);

  return [unzippedFiles, fileError || zipError];
};
