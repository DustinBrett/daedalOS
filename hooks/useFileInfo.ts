import { useFileSystem } from 'contexts/fileSystem';
import { extname } from 'path';
import { useEffect, useState } from 'react';
import { IMAGE_FILE_EXTENSIONS } from 'utils/constants';
import {
  bufferToUrl,
  getIconByFileExtension,
  getProcessByFileExtension,
  getShortcut
} from 'utils/fileFunctions';

type FileInfo = {
  icon: string;
  pid: string;
  url: string;
};

const useFileInfo = (path: string): FileInfo => {
  const [info, setInfo] = useState<FileInfo>({
    icon: '',
    pid: '',
    url: ''
  });
  const { fs } = useFileSystem();

  useEffect(() => {
    if (fs) {
      const extension = extname(path);
      const getInfoByFileExtension = () =>
        setInfo({
          icon: getIconByFileExtension(extension),
          pid: getProcessByFileExtension(extension),
          url: path
        });

      if (extension === '.url') {
        getShortcut(path, fs)
          .then(({ BaseURL: pid, IconFile: icon, URL: url }) =>
            setInfo({ icon, pid, url })
          )
          .catch(getInfoByFileExtension);
      } else if (IMAGE_FILE_EXTENSIONS.includes(extension)) {
        fs.readFile(path, (_error, contents = Buffer.from('')) =>
          setInfo({
            icon: bufferToUrl(contents),
            pid: 'ImageViewer',
            url: path
          })
        );
      } else {
        getInfoByFileExtension();
      }
    }
  }, [fs, path]);

  return info;
};

export default useFileInfo;
