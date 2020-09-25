import type { RefObject } from 'react';
import type { DraggableData, Rnd, RndDragEvent } from 'react-rnd';

export const appendElement = (
  parentElement: HTMLElement,
  childElement: HTMLElement
): HTMLElement => {
  if (parentElement && childElement) {
    parentElement.appendChild?.(childElement);
  }

  return childElement;
};

export const focusOnDrag = (
  _event: RndDragEvent,
  { node }: DraggableData
): void => node.focus();

export const focusResizableElementRef = (elementRef: RefObject<Rnd>): void =>
  elementRef?.current?.resizableElement?.current?.focus?.();

export const lockDocumentTitle = (): void => {
  if (
    typeof Object.getOwnPropertyDescriptor(document, 'title')?.set ===
    'undefined'
  ) {
    Object.defineProperty(document, 'title', { set: () => {} });
  }
};

export const getTargetCenterPosition = (element: Element): Partial<DOMRect> => {
  const { x, y, height, width } = element.getBoundingClientRect();

  return {
    x: Math.floor(x + width / 2),
    y: Math.floor(y + height / 2)
  };
};
