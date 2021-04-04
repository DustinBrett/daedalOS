import { useFileSystem } from 'contexts/fileSystem';
import { extname } from 'path';
import { useEffect, useState } from 'react';
import { IMAGE_FILE_EXTENSIONS } from 'utils/constants';
import {
  getIconByFileExtension,
  getProcessByFileExtension,
  getShortcut
} from 'utils/fileFunctions';

type FileInfo = {
  icon: string;
  pid: string;
};

const useFileInfo = (path: string): FileInfo => {
  const [info, setInfo] = useState<FileInfo>({
    icon: '',
    pid: ''
  });
  const { fs } = useFileSystem();

  useEffect(() => {
    if (fs) {
      const extension = extname(path);
      const getInfoByFileExtension = () =>
        setInfo({
          icon: getIconByFileExtension(extension),
          pid: getProcessByFileExtension(extension)
        });

      if (extension === '.url') {
        getShortcut(path, fs)
          .then(({ URL: pid, IconFile: icon }) => setInfo({ icon, pid }))
          .catch(getInfoByFileExtension);
      } else if (IMAGE_FILE_EXTENSIONS.includes(extension)) {
        setInfo({
          icon: path,
          pid: 'ImageViewer'
        });
      } else {
        getInfoByFileExtension();
      }
    }
  }, [fs, path]);

  return info;
};

export default useFileInfo;
