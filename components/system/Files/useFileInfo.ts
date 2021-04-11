import {
  getIconByFileExtension,
  getProcessByFileExtension
} from 'components/system/Files/functions';
import { useFileSystem } from 'contexts/fileSystem';
import ini from 'ini';
import { extname } from 'path';
import { useEffect, useState } from 'react';
import { IMAGE_FILE_EXTENSIONS } from 'utils/constants';
import { bufferToUrl } from 'utils/functions';

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
      const extension = extname(path).toLowerCase();
      const getInfoByFileExtension = () =>
        setInfo({
          icon: getIconByFileExtension(extension),
          pid: getProcessByFileExtension(extension),
          url: path
        });

      if (extension === '.url') {
        fs.readFile(path, (error, contents = Buffer.from('')) => {
          if (error) {
            getInfoByFileExtension();
          } else {
            const {
              InternetShortcut: {
                BaseURL: pid = '',
                IconFile: icon = '',
                URL: url = ''
              }
            } = ini.parse(contents.toString());

            setInfo({ icon, pid, url });
          }
        });
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
