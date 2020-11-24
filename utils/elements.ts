import type { DraggableData, Rnd, RndDragEvent } from 'react-rnd';

import { NEXT_CONTAINER_ID } from './constants';

const imageContainerElements = ['BUTTON', 'LI', 'TR'];

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

export const focusResizableElementRef = (
  elementRef: React.RefObject<Rnd>
): void => elementRef.current?.resizableElement.current?.focus();

export const focusClosestFocusableElement = (
  element: HTMLElement | null
): void => element?.closest<HTMLElement>(':not(li)[tabindex]')?.focus();

export const focusClosestFocusableElementFromRef = (
  elementRef: React.RefObject<HTMLElement>
) => (): void => {
  focusClosestFocusableElement(elementRef.current);
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
    focusImage && imageContainerElements.includes(element?.nodeName || '')
      ? element?.getElementsByTagName?.('img')?.[0] ||
        element?.getElementsByTagName?.('figure')?.[0] ||
        element
      : element;
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

export const getNextContainerElement = (): HTMLDivElement =>
  document.getElementById(NEXT_CONTAINER_ID) as HTMLDivElement;
