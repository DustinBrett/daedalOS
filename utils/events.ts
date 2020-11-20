import type { FileDropEvents } from '@/types/utils/events';
import type { RndDragCallback } from 'react-rnd';

import { CLICK_DELAY_IN_MILLISECONDS } from '@/utils/constants';

const haltEvent = (event: React.DragEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

export const useFileDrop = (
  onFileDrop: (event: React.DragEvent, file: File) => void
): FileDropEvents => ({
  onDragLeave: (event: React.DragEvent) => haltEvent(event),
  onDragEnter: (event: React.DragEvent) => haltEvent(event),
  onDragOver: (event: React.DragEvent) => haltEvent(event),
  onDrop: (event: React.DragEvent) => {
    const { dataTransfer: { files: [file] = [] } = {} } = event;

    haltEvent(event);
    onFileDrop(event, file);
  }
});

export const onTouchEventsOnly: RndDragCallback = (e): void => {
  if (e instanceof MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
};

export class ClickHandler {
  clickTimer?: NodeJS.Timeout;

  singleClick;

  doubleClick;

  constructor({
    singleClick,
    doubleClick
  }: {
    singleClick?: (event: React.MouseEvent<Element, MouseEvent>) => void;
    doubleClick?: (event: React.MouseEvent<Element, MouseEvent>) => void;
  }) {
    this.singleClick = singleClick;
    this.doubleClick = doubleClick;
  }

  clickHandler = (event: React.MouseEvent<Element, MouseEvent>): void => {
    if (!this.clickTimer) {
      this.clickTimer = setTimeout(() => {
        this.clickTimer = undefined;
        this.singleClick?.(event);
      }, CLICK_DELAY_IN_MILLISECONDS);
    } else {
      clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
      this.doubleClick?.(event);
    }
  };
}
