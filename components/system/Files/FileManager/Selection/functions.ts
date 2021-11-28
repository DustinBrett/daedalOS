import type { SelectionRect } from "components/system/Files/FileManager/Selection/useSelection";

export const isSelectionIntersecting = (
  element: DOMRect,
  containerElement: DOMRect,
  selection: SelectionRect,
  containerScrollTop: number
): boolean => {
  const { x = 0, y = 0, width = 0, height = 0 } = selection;
  const selectionRect = new DOMRect(x, y, Number(width), Number(height));

  return !(
    element.left - containerElement.left >= selectionRect.right ||
    element.top - containerElement.top >= selectionRect.bottom ||
    element.right - containerElement.left <= selectionRect.left ||
    element.bottom - containerElement.top + containerScrollTop <=
      selectionRect.top
  );
};
