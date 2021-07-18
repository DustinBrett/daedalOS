import type { FileSystemConfiguration } from "browserfs";
import index from "public/.index/fs.bfs.json";

const FileSystemConfig: FileSystemConfiguration = {
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
          fs: "IndexedDB",
        },
      },
    },
  },
};

export default FileSystemConfig;
