import { useEffect, useRef, useState } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledScreenSaver from "components/system/Dialogs/ScreenSaver/StyledScreenSaver";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import {
  FOCUSABLE_ELEMENT,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { restoreFocus } from "utils/keyboard";

const ONE_TIME_PASSIVE_CAPTURE_EVENT = {
  capture: true,
  once: true,
  passive: true,
} as AddEventListenerOptions;

const triggerEvents = [
  "contextmenu",
  "click",
  "wheel",
  "focus",
  "blur",
  "keyup",
  "keydown",
  "mouseup",
  "mousedown",
  "mousemove",
  "touchstart",
  "touchend",
  "touchmove",
];

// Like Windows, the key or tap that wakes it does nothing else
const CANCELED_EVENTS = new Set(["keydown", "touchstart"]);

const ScreenSaver: FC<ComponentProcessProps> = ({ id }) => {
  const { close } = useProcessesActions();
  const { title = "", url = "" } = useProcess(id);
  const { readFile } = useFileSystemActions();
  const [srcDoc, setSrcDoc] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  // eslint-disable-next-line react/hook-use-state
  const [focusedElement] = useState(() => document.activeElement);
  const loadScreenSaver = async (): Promise<void> =>
    setSrcDoc({
      [url]: (await readFile(url)).toString(),
    });
  const closedRef = useRef(false);
  const closeScreenSaver = (event?: Event): void => {
    if (event?.cancelable && CANCELED_EVENTS.has(event.type)) {
      event.preventDefault();
    }

    if (closedRef.current) return;

    closedRef.current = true;

    if (iframeRef.current) {
      iframeRef.current.style.display = "none";
    }

    close(id);
  };

  useEffect(
    () => () => {
      // Waking up returns focus to where it was before the screen saver, once
      // its frame is gone, as Firefox ignores focus moves while it has focus
      if (closedRef.current && focusedElement !== document.body) {
        requestAnimationFrame(() => restoreFocus(focusedElement));
      }
    },
    [focusedElement]
  );

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- False positive: state is only set after an await
    if (url && !srcDoc[url]) loadScreenSaver();
  }, [loadScreenSaver, srcDoc, url]);

  return (
    <StyledScreenSaver
      ref={iframeRef}
      onLoad={(event) => {
        // Closing drops the srcdoc, and that blank load must not take focus
        if (closedRef.current) return;

        const { contentWindow: iframeWindow } = event?.currentTarget || {};

        if (iframeWindow) {
          iframeWindow.focus();

          requestAnimationFrame(() =>
            setTimeout(
              () =>
                triggerEvents.forEach((eventName) =>
                  iframeWindow.addEventListener(eventName, closeScreenSaver, {
                    ...ONE_TIME_PASSIVE_CAPTURE_EVENT,
                    passive: !CANCELED_EVENTS.has(eventName),
                  })
                ),
              TRANSITIONS_IN_MILLISECONDS.DOUBLE_CLICK
            )
          );
        } else {
          closeScreenSaver();
        }
      }}
      srcDoc={srcDoc[url]}
      title={title}
      {...FOCUSABLE_ELEMENT}
    />
  );
};

export default ScreenSaver;
