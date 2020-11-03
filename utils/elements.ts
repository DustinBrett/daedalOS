import type { DraggableData, Rnd, RndDragEvent } from 'react-rnd';
import type { RefObject } from 'react';

export const appendElement = (
  parentElement: HTMLElement,
  childElement: HTMLElement
): HTMLElement => {
  if (parentElement && childElement) {
    parentElement.appendChild(childElement);
  }

  return childElement;
};

export const focusOnDrag = (
  _event: RndDragEvent,
  { node }: DraggableData
): void => node.focus();

export const focusResizableElementRef = (elementRef: RefObject<Rnd>): void =>
  elementRef.current?.resizableElement.current?.focus();

export const focusClosestFocusableElementFromRef = (
  elementRef: RefObject<HTMLElement>
) => (): void => {
  elementRef.current?.closest<HTMLElement>(':not(li)[tabindex]')?.focus();
};

export const lockDocumentTitle = (): void => {
  if (
    typeof Object.getOwnPropertyDescriptor(document, 'title')?.set ===
    'undefined'
  ) {
    /* eslint @typescript-eslint/no-empty-function: off */
    Object.defineProperty(document, 'title', { set: () => {} });
  }
};

export const getTargetCenterPosition = (
  element?: HTMLElement,
  focusImage = false
): { x: number; y: number } => {
  const idealElement =
    (focusImage && element?.getElementsByTagName?.('img')?.[0]) ||
    element?.getElementsByTagName?.('figure')?.[0] ||
    element;
  const { x = 0, y = 0, height = 0, width = 0 } =
    idealElement?.getBoundingClientRect() || {};

  return {
    x: Math.floor(x + width / 2),
    y: Math.floor(y + height / 2)
  };
};

export const getTargetCenterImagePosition = (
  element: HTMLElement
): { x: number; y: number } => getTargetCenterPosition(element, true);
