import { memo, useCallback, useEffect, useRef, useState } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledScreenSaver from "components/system/Dialogs/ScreenSaver/StyledScreenSaver";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import {
  FOCUSABLE_ELEMENT,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";

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

const ScreenSaver: FC<ComponentProcessProps> = ({ id }) => {
  const { close } = useProcessesActions();
  const { title = "", url = "" } = useProcess(id);
  const { readFile } = useFileSystemActions();
  const [srcDoc, setSrcDoc] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadScreenSaver = useCallback(
    async () =>
      setSrcDoc({
        [url]: (await readFile(url)).toString(),
      }),
    [readFile, url]
  );
  const closeScreenSaver = useCallback(
    (event?: Event) => {
      // Stops the tap from also clicking what was under the screen saver
      if (event?.type === "touchstart" && event.cancelable) {
        event.preventDefault();
      }

      if (iframeRef.current) {
        iframeRef.current.style.display = "none";
      }

      close(id);
    },
    [close, id]
  );

  useEffect(() => {
    if (url && !srcDoc[url]) loadScreenSaver();
  }, [loadScreenSaver, srcDoc, url]);

  return (
    <StyledScreenSaver
      ref={iframeRef}
      onLoad={(event) => {
        const { contentWindow: iframeWindow } = event?.currentTarget || {};

        if (iframeWindow) {
          iframeWindow.focus();

          requestAnimationFrame(() =>
            setTimeout(
              () =>
                triggerEvents.forEach((eventName) =>
                  iframeWindow.addEventListener(eventName, closeScreenSaver, {
                    ...ONE_TIME_PASSIVE_CAPTURE_EVENT,
                    passive: eventName !== "touchstart",
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

export default memo(ScreenSaver);
