import { useMenuActions } from "contexts/menu";
import {
  type ContextMenuCapture,
  type MenuItem,
} from "contexts/menu/useMenuContextState";
import { useSessionActions } from "contexts/session";
import { useSnapshots } from "hooks/useSnapshots";
import { DESKTOP_PATH, SAVE_PATH } from "utils/constants";
import { canvasToBuffer } from "utils/functions";

const useCanvasContextMenu = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  prompt: string,
  isImageReady: boolean
): ContextMenuCapture => {
  const { contextMenu } = useMenuActions();
  const { setWallpaper } = useSessionActions();
  const { createSnapshot } = useSnapshots();
  const saveCanvasImage = async (savePath: string): Promise<string> => {
    if (canvasRef.current) {
      return createSnapshot(
        `${prompt}.png`,
        canvasToBuffer(canvasRef.current),
        undefined,
        false,
        savePath
      );
    }

    return "";
  };

  return contextMenu(() => {
    const menuItems: MenuItem[] = [
      {
        action: () => saveCanvasImage(DESKTOP_PATH),
        disabled: !isImageReady,
        label: "Save to desktop",
      },
      {
        action: () =>
          saveCanvasImage(SAVE_PATH).then((newFileName) => {
            if (newFileName) {
              setWallpaper(`${SAVE_PATH}/${newFileName}`);
            }
          }),
        disabled: !isImageReady,
        label: "Set as background",
      },
    ];
    return menuItems;
  });
};

export default useCanvasContextMenu;
