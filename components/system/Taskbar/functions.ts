import { PREVENT_SCROLL } from "utils/constants";

export const START_BUTTON_TITLE = "Start";
export const SEARCH_BUTTON_TITLE = "Type here to search";

/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
export const importAIButton = () =>
  import("components/system/Taskbar/AI/AIButton");
export const importAIChat = () => import("components/system/Taskbar/AI/AIChat");
export const importCalendar = () =>
  import("components/system/Taskbar/Calendar");
export const importSearch = () => import("components/system/Taskbar/Search");
export const importStartMenu = () => import("components/system/StartMenu");
/* eslint-enable @typescript-eslint/explicit-function-return-type */

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
