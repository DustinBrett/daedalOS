import type { FileSystemConfiguration } from 'browserfs';
import bfsJson from 'public/.index/fs.bfs.json';

const FileSystemConfig: FileSystemConfiguration = {
  fs: 'MountableFileSystem',
  options: {
    '/': {
      fs: 'OverlayFS',
      options: {
        readable: {
          fs: 'XmlHttpRequest',
          options: {
            index: bfsJson
          }
        },
        writable: {
          fs: 'IndexedDB',
          options: {
            storeName: 'browser-fs-cache'
          }
        }
      }
    }
  }
};

export default FileSystemConfig;
