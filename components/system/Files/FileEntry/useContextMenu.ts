import useFile from 'components/system/Files/FileEntry/useFile';
import type { MenuItem } from 'contexts/menu/useMenuContextState';
import processDirectory from 'contexts/process/directory';

const useContextMenu = (url: string, pid: string): MenuItem[] => {
  const { icon: pidIcon } = processDirectory[pid] || {};
  const openFile = useFile(url, pid);
  const menuItems: MenuItem[] = [];

  if (pid) {
    menuItems.push({
      icon: pidIcon,
      label: 'Open',
      primary: true,
      action: openFile
    });
  }

  return menuItems;
};

export default useContextMenu;
