import { PREVENT_SCROLL } from "utils/constants";

export const maybeCloseTaskbarMenu = (
  { relatedTarget: focusedElement }: React.FocusEvent<HTMLElement>,
  menuElement: HTMLElement | null,
  toggleMenu: (toggle: boolean) => void,
  focusElement?: HTMLElement | null,
  closeOnTaskbarEntries = false
): void => {
  const focusedInsideMenu =
    focusedElement && menuElement?.contains(focusedElement);

  if (!focusedInsideMenu) {
    const taskbarElement = menuElement?.nextSibling;
    const focusedTaskbarEntries = focusedElement === taskbarElement;
    const focusedTaskbarButton =
      focusedElement?.parentElement === taskbarElement;

    if (
      (closeOnTaskbarEntries && focusedTaskbarEntries) ||
      (!focusedTaskbarEntries && !focusedTaskbarButton)
    ) {
      toggleMenu(false);
    } else {
      (focusElement || menuElement)?.focus(PREVENT_SCROLL);
    }
  }
};
