import processDirectoryCustom from "contexts/process/directoryCustom";
import processDirectoryDefault from "contexts/process/directoryDefault";

import type { Processes } from "./types";

const processDirectory: Processes = {
  ...processDirectoryDefault,
  ...processDirectoryCustom,
};

export default processDirectory;
