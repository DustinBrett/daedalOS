import ExplorerIcon from '@/assets/icons/Explorer.png';

import { Stats } from 'browserfs/dist/node/generic/emscripten_fs';

import { FC, useContext, useEffect, useState } from 'react';
import App from '@/contexts/App';
import { FilesContext, FilesProvider } from '@/contexts/Files';

type FsRequest = {
  dir?: string;
};

type StatsProto = {
  isDirectory: () => boolean;
  isFile: () => boolean;
};

type FsDirectoryEntry = {
  path: string;
  ctime: Date;
  size: number;
  isDirectory: boolean;
};

const DirectoryListing: FC<FsRequest> = ({ dir = '/' }) => {
  const fs = useContext(FilesContext),
    [directoryContents, setDirectoryContents] = useState<
      Array<FsDirectoryEntry>
    >([]);

  useEffect(() => {
    fs?.readdir?.(dir, async (_error, contents = []) => {
      const contentsWithStats = await Promise.all(
        contents.map(async (file) => {
          const path = `${dir}${file}`,
            stats = (await new Promise((resolve) =>
              fs?.stat?.(path, (_error, stats) => resolve(stats))
            )) as Stats & StatsProto,
            { ctime, size } = stats || {},
            isDirectory = stats?.isDirectory() || false;

          return { path, ctime, size, isDirectory };
        })
      );

      setDirectoryContents(contentsWithStats);
    });
  }, [fs]);

  return (
    <article>
      <ol>
        {directoryContents.map(({ path, size, ctime, isDirectory }) => (
          <li key={path}>
            {path}
            {size}
            {ctime && new Date(ctime).toLocaleDateString()}
            {isDirectory && 'directory'}
          </li>
        ))}
      </ol>
    </article>
  );
};

const Explorer: FC = () => (
  <FilesProvider>
    <DirectoryListing />
  </FilesProvider>
);

export default new App({
  component: Explorer,
  icon: ExplorerIcon,
  name: 'Explorer'
});
