import { useCallback, useMemo } from "react";
import { useMenu } from "contexts/menu";
import {
  type ContextMenuCapture,
  type MenuItem,
} from "contexts/menu/useMenuContextState";
import { useFileSystem } from "contexts/fileSystem";
import { DESKTOP_PATH, SAVE_PATH } from "utils/constants";
import { useSession } from "contexts/session";
import { canvasToBuffer } from "utils/functions";

const useCanvasContextMenu = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  prompt: string,
  isImageReady: boolean
): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { createPath, updateFolder } = useFileSystem();
  const { setWallpaper } = useSession();
  const saveCanvasImage = useCallback(
    async (savePath: string): Promise<string> => {
      let newFileName = `${prompt}.png`;

      if (canvasRef.current) {
        newFileName = await createPath(
          newFileName,
          savePath,
          canvasToBuffer(canvasRef.current)
        );

        updateFolder(savePath);
      }

      return newFileName;
    },
    [canvasRef, createPath, prompt, updateFolder]
  );

  return useMemo(
    () =>
      contextMenu?.(() => {
        const menuItems: MenuItem[] = [
          {
            action: () => saveCanvasImage(DESKTOP_PATH),
            disabled: !isImageReady,
            label: "Save to desktop",
          },
          {
            action: () =>
              saveCanvasImage(SAVE_PATH).then((newFileName) =>
                setWallpaper(`${SAVE_PATH}/${newFileName}`)
              ),
            disabled: !isImageReady,
            label: "Set as background",
          },
        ];
        return menuItems;
      }),
    [contextMenu, isImageReady, saveCanvasImage, setWallpaper]
  );
};

export default useCanvasContextMenu;
