import useFile from 'components/system/Files/FileEntry/useFile';
import type { MenuItem } from 'contexts/menu/useMenuContextState';
import processDirectory from 'contexts/process/directory';

const useContextMenu = (
  url: string,
  pid: string,
  deleteFile: () => void,
  renameFile: () => void
): MenuItem[] => {
  const { icon: pidIcon } = processDirectory[pid] || {};
  const openFile = useFile(url, pid);
  const menuItems: MenuItem[] = [
    { label: 'Delete', action: deleteFile },
    { label: 'Rename', action: renameFile }
  ];

  if (pid) {
    menuItems.unshift(
      {
        icon: pidIcon,
        label: 'Open',
        primary: true,
        action: openFile
      },
      { separator: 1 }
    );
  }

  return menuItems;
};

export default useContextMenu;
