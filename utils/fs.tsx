import type { ListingObj } from '@/utils/fs.d';

export const writableJsonFs = (
  path: string,
  listingUrlOrObj: string | ListingObj
): { [key: string]: BrowserFS.FileSystemConfiguration } => ({
  [path]: {
    fs: 'OverlayFS',
    options: {
      readable: {
        fs: 'XmlHttpRequest',
        options: {
          index: listingUrlOrObj
        }
      },
      writable: {
        fs: 'IndexedDB',
        options: {
          storeName: `browser-fs-cache (${path})`
        }
      }
    }
  }
});
