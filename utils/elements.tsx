import type { RefObject } from 'react';
import type { DraggableData, Rnd, RndDragEvent } from 'react-rnd';

export const appendElement = (
  parentElement: HTMLElement,
  childElement: HTMLElement
): void => {
  if (parentElement && childElement) {
    parentElement.appendChild?.(childElement);
  }
};

export const focusOnDrag = (
  _event: RndDragEvent,
  { node }: DraggableData
): void => node.focus();

export const focusResizableElementRef = (elementRef: RefObject<Rnd>): void =>
  elementRef?.current?.resizableElement?.current?.focus?.();
