const CLICK_DELAY_IN_MILLISECONDS = 300;

export class ClickHandler {
  clickTimer: NodeJS.Timeout | undefined;

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
