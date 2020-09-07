const CLICK_DELAY_IN_MILLISECONDS = 300;

export class ClickHandler {
  clickTimer: NodeJS.Timeout | undefined;

  singleClick;
  doubleClick;

  constructor({
    singleClick,
    doubleClick
  }: {
    singleClick?: () => void,
    doubleClick?: () => void
  }) {
    this.singleClick = singleClick;
    this.doubleClick = doubleClick;
  }

  clickHandler = (): void => {
    if (!this.clickTimer) {
      this.clickTimer = setTimeout(() => {
        this.clickTimer = undefined;
        this.singleClick?.();
      }, CLICK_DELAY_IN_MILLISECONDS);
    } else {
      clearTimeout(this.clickTimer);
      this.clickTimer = undefined;
      this.doubleClick?.();
    }
  };
}
