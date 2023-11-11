import { PREVENT_SCROLL } from "utils/constants";

export const START_BUTTON_TITLE = "Start";
export const SEARCH_BUTTON_TITLE = "Type here to search";

export const maybeCloseTaskbarMenu = (
  { relatedTarget: focusedElement }: React.FocusEvent<HTMLElement>,
  menuElement: HTMLElement | null,
  toggleMenu: (toggle: boolean) => void,
  focusElement?: HTMLElement | null,
  buttonTitle?: string,
  closeOnTaskbarEntries = false
): void => {
  const focusedInsideMenu =
    focusedElement && menuElement?.contains(focusedElement);

  if (!focusedInsideMenu) {
    const taskbarElement = menuElement?.nextSibling;
    const focusedTaskbarEntries = focusedElement === taskbarElement;
    const focusedTaskbarButton =
      focusedElement?.parentElement === taskbarElement;
    const focusedOnSelfButton =
      (focusedElement as HTMLElement)?.title === buttonTitle;

    if (
      focusedElement &&
      ((closeOnTaskbarEntries && focusedTaskbarEntries) ||
        (!focusedTaskbarEntries &&
          (!focusedTaskbarButton || !focusedOnSelfButton)))
    ) {
      toggleMenu(false);
    } else {
      (focusElement || menuElement)?.focus(PREVENT_SCROLL);
    }
  }
};
