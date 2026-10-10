import { useEffect, useState } from "react";
import { useProcess, useProcessesActions } from "contexts/process";
import { FOCUSABLE_ELEMENT } from "utils/constants";
import {
  getFocusedBefore,
  isComposingKey,
  loopFocus,
  restoreFocus,
  whenFocusLost,
} from "utils/keyboard";

const useCloseOnEscape = (
  id: string
): {
  onKeyDownCapture: React.KeyboardEventHandler<HTMLElement>;
  tabIndex: number;
} => {
  const { closeWithTransition } = useProcessesActions();
  const { componentWindow } = useProcess(id);
  // eslint-disable-next-line react/hook-use-state
  const [openedFrom] = useState(() => getFocusedBefore(componentWindow));

  // Like Windows, closing a dialog from the keyboard returns focus to where it
  // was opened from
  useEffect(
    () => () => whenFocusLost(() => restoreFocus(openedFrom)),
    [openedFrom]
  );

  return {
    onKeyDownCapture: (event) => {
      if (event.key === "Escape" && !isComposingKey(event.nativeEvent)) {
        event.preventDefault();
        closeWithTransition(id);
        restoreFocus(openedFrom, componentWindow);
      } else {
        // Like Windows dialogs, Tab skips the title bar's buttons
        loopFocus(event, [event.currentTarget]);
      }
    },
    ...FOCUSABLE_ELEMENT,
  };
};

export default useCloseOnEscape;
