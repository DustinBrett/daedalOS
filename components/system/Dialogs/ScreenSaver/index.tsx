import { useCallback, useEffect, useState } from "react";
import StyledScreenSaver from "components/system/Dialogs/ScreenSaver/StyledScreenSaver";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

const ONE_TIME_PASSIVE_CAPTURE_EVENT = {
  capture: true,
  once: true,
  passive: true,
} as AddEventListenerOptions;

const triggerEvents = [
  "contextmenu",
  "click",
  "wheel",
  "blur",
  "focus",
  "keydown",
  "pointerdown",
  "touchstart",
];

const delayedTriggerEvents = [
  "pointermove",
  "touchmove",
  "keyup",
  "pointerup",
  "touchend",
];

const ScreenSaver: FC<ComponentProcessProps> = ({ id }) => {
  const { processes: { [id]: { title = "", url = "" } = {} } = {}, close } =
    useProcesses();
  const { readFile } = useFileSystem();
  const [srcDoc, setSrcDoc] = useState<Record<string, string>>({});
  const loadScreenSaver = useCallback(
    async () =>
      setSrcDoc({
        [url]: (await readFile(url)).toString(),
      }),
    [readFile, url]
  );
  const closeScreenSaver = useCallback(() => close(id), [close, id]);

  useEffect(() => {
    if (url && !srcDoc[url]) loadScreenSaver();
  }, [loadScreenSaver, srcDoc, url]);

  return (
    <StyledScreenSaver
      onLoad={(event) => {
        const { contentWindow: iframeWindow } = event?.currentTarget || {};

        if (iframeWindow) {
          iframeWindow.focus();

          triggerEvents.forEach((eventName) =>
            iframeWindow.addEventListener(
              eventName,
              closeScreenSaver,
              ONE_TIME_PASSIVE_CAPTURE_EVENT
            )
          );

          setTimeout(
            () =>
              delayedTriggerEvents.forEach((eventName) =>
                iframeWindow.addEventListener(
                  eventName,
                  closeScreenSaver,
                  ONE_TIME_PASSIVE_CAPTURE_EVENT
                )
              ),
            MILLISECONDS_IN_SECOND
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

export default ScreenSaver;
