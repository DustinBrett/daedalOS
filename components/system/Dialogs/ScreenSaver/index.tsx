import { memo, useCallback, useEffect, useRef, useState } from "react";
import StyledScreenSaver from "components/system/Dialogs/ScreenSaver/StyledScreenSaver";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

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
  "pointerup",
  "pointerdown",
  "pointermove",
  "touchstart",
  "touchend",
  "touchmove",
];

const ScreenSaver: FC<ComponentProcessProps> = ({ id }) => {
  const { processes: { [id]: { title = "", url = "" } = {} } = {}, close } =
    useProcesses();
  const { readFile } = useFileSystem();
  const [srcDoc, setSrcDoc] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadScreenSaver = useCallback(
    async () =>
      setSrcDoc({
        [url]: (await readFile(url)).toString(),
      }),
    [readFile, url]
  );
  const closeScreenSaver = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.style.display = "none";
    }

    close(id);
  }, [close, id]);

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
                  iframeWindow.addEventListener(
                    eventName,
                    closeScreenSaver,
                    ONE_TIME_PASSIVE_CAPTURE_EVENT
                  )
                ),
              TRANSITIONS_IN_MILLISECONDS.DOUBLE_CLICK
            )
          );
        } else {
          closeScreenSaver();
        }
      }}
      srcDoc={srcDoc[url]}
      tabIndex={-1}
      title={title}
    />
  );
};

export default memo(ScreenSaver);
