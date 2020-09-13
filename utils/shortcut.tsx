import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { Shortcut } from '@/utils/shortcut.d';

import * as ini from 'ini';

export const parseShortcut = (fs: FSModule, path: string): Promise<Shortcut> =>
  new Promise((resolve) => {
    fs?.readFile?.(path, (_error, fileBuffer) => {
      const {
        InternetShortcut: { URL: url, IconFile }
      } = ini.parse(fileBuffer?.toString() || '');

      resolve({ url, icon: new URL(IconFile).pathname });
    });
  });
