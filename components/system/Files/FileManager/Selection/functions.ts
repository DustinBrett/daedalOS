import type { SelectionRect } from "components/system/Files/FileManager/Selection/useSelection";

export const isSelectionIntersecting = (
  element: DOMRect,
  selection: SelectionRect
): boolean => {
  const { x = 0, y = 0, width = 0, height = 0 } = selection;
  const selectionRect = new DOMRect(x, y, Number(width), Number(height));

  return !(
    element.left >= selectionRect.right ||
    element.top >= selectionRect.bottom ||
    element.right <= selectionRect.left ||
    element.bottom <= selectionRect.top
  );
};
