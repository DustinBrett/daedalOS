import type { FSModule } from 'browserfs/dist/node/core/FS';

export type FileSystemContextState = {
  fs: FSModule | null;
};
