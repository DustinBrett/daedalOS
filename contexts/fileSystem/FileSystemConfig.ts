import type { FileSystemConfiguration } from "browserfs";
import index from "public/.index/fs.bfs.json";

const FileSystemConfig = (writeToMemory = false): FileSystemConfiguration => ({
  fs: "MountableFileSystem",
  options: {
    "/": {
      fs: "OverlayFS",
      options: {
        readable: {
          fs: "HTTPRequest",
          options: { index },
        },
        writable: {
          fs: writeToMemory ? "InMemory" : "IndexedDB",
        },
      },
    },
  },
});

export default FileSystemConfig;
