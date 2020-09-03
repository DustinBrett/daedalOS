import ExplorerIcon from '@/assets/icons/Explorer.png';

import { FC, useContext, useEffect, useState } from 'react';
import App from '@/contexts/App';
import { FilesContext, FilesProvider } from '@/contexts/Files';

type FsRequest = {
  dir?: string;
};

const DirectoryListing: FC<FsRequest> = ({ dir = '/' }) => {
  const fs = useContext(FilesContext),
    [directoryContents, setDirectoryContents] = useState<Array<string>>([]);

  useEffect(() => {
    fs?.readdir?.(dir, (_error, contents = []) => {
      setDirectoryContents(contents);
    });
  }, [fs]);

  return (
    <article>
      <ol>
        {directoryContents.map((entry) => (
          <li key={entry}>{entry}</li>
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
