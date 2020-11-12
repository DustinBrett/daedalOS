import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { Shortcut } from '@/types/utils/shortcut';

import * as ini from 'ini';
import { isValidUrl } from '@/utils/url';

const shortcutCache: {
  [key: string]: Shortcut;
} = {};

export const parseShortcut = (fs: FSModule, path: string): Promise<Shortcut> =>
  new Promise((resolve) => {
    if (!shortcutCache[path]) {
      fs.readFile(path, (_error, fileBuffer) => {
        const {
          InternetShortcut: { URL: url, IconFile }
        } = ini.parse(fileBuffer?.toString() || '');
        const icon = isValidUrl(IconFile) ? new URL(IconFile).pathname : '';

        shortcutCache[path] = { url, icon };

        resolve(shortcutCache[path]);
      });
    } else {
      resolve(shortcutCache[path]);
    }
  });
