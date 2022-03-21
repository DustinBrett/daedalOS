import type { FileSystemConfiguration } from "browserfs";
import { fs9pToBfs } from "contexts/fileSystem/functions";

const FileSystemConfig = (writeToMemory = false): FileSystemConfiguration => ({
  fs: "MountableFileSystem",
  options: {
    "/": {
      fs: "OverlayFS",
      options: {
        readable: {
          fs: "HTTPRequest",
          options: { index: fs9pToBfs() },
        },
        writable: {
          fs: writeToMemory ? "InMemory" : "IndexedDB",
        },
      },
    },
  },
});

export default FileSystemConfig;
