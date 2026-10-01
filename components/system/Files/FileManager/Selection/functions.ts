import { type SelectionRect } from "components/system/Files/FileManager/Selection/useSelection";

type SelectionStyling = {
  height?: string;
  transform?: string;
  width?: string;
};

export const createSelectionStyling = (
  isSelecting: boolean,
  h: number | string,
  w: number | string,
  x: number | string,
  y: number | string
): SelectionStyling => {
  if (!isSelecting) return Object.create(null) as SelectionStyling;

  const height = Number(h);
  const width = Number(w);

  return {
    height: `${Math.abs(height)}px`,
    transform: `translate(
        ${Number(x) + Math.min(width, 0)}px,
        ${Number(y) + Math.min(height, 0)}px)`,
    width: `${Math.abs(width)}px`,
  };
};

export const isSelectionIntersecting = (
  element: DOMRect,
  containerElement: DOMRect,
  selection: SelectionRect,
  containerScrollTop: number
): boolean => {
  const { height = 0, width = 0, x = 0, y = 0 } = selection;
  const selectionRect = new DOMRect(x, y, Number(width), Number(height));

  return !(
    element.left - containerElement.left >= selectionRect.right ||
    element.top - containerElement.top + containerScrollTop >=
      selectionRect.bottom ||
    element.right - containerElement.left <= selectionRect.left ||
    element.bottom - containerElement.top + containerScrollTop <=
      selectionRect.top
  );
};
