import { DESKTOP_PATH } from "utils/constants";

export const config = {
  paths: {
    vs: "/Program Files/MonacoEditor/vs",
  },
};

export const theme = "vs-dark";

export const customExtensionLanguages: Record<string, string> = {
  ".whtml": ".html",
};

export const URL_DELIMITER = "|";

export const DEFAULT_SAVE_PATH = `${DESKTOP_PATH}/Untitled.txt`;
