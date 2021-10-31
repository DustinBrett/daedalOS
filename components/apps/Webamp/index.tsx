import {
  cleanBufferOnSkinLoad,
  focusWindow,
  parseTrack,
  unFocus,
} from "components/apps/Webamp/functions";
import StyledWebamp from "components/apps/Webamp/StyledWebamp";
import useWebamp from "components/apps/Webamp/useWebamp";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bufferToUrl, loadFiles } from "utils/functions";
import type { Options } from "webamp";

const Webamp = ({ id }: ComponentProcessProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { readFile } = useFileSystem();
  const { processes: { [id]: { url = "" } = {} } = {} } = useProcesses();
  const [currentUrl, setCurrentUrl] = useState(url);
  const { initWebamp, webampCI } = useWebamp(id);
  const windowTransitions = useWindowTransitions(id);
  const focusEvents = useMemo(
    () => ({
      onBlurCapture: () => webampCI && unFocus(webampCI),
      onFocusCapture: () => webampCI && focusWindow(webampCI, "main"),
    }),
    [webampCI]
  );
  const { zIndex, ...focusableProps } = useFocusable(id, focusEvents);
  const getUrlOptions = useCallback(async (): Promise<Options> => {
    if (url) {
      const extension = extname(url);

      if (extension === ".mp3") {
        return {
          initialTracks: [await parseTrack(await readFile(url), basename(url))],
        };
      }

      if (extension === ".wsz") {
        return { initialSkin: { url: bufferToUrl(await readFile(url)) } };
      }
    }

    return {};
  }, [readFile, url]);
  const loadWebampUrl = useCallback(async () => {
    if (webampCI) {
      const { initialTracks, initialSkin } = await getUrlOptions();

      if (initialTracks) webampCI.setTracksToPlay(initialTracks);
      else if (initialSkin) {
        cleanBufferOnSkinLoad(webampCI, initialSkin.url);
        webampCI.setSkinFromUrl(initialSkin.url);
      }
    }
  }, [getUrlOptions, webampCI]);

  useEffect(() => {
    if (containerRef.current && !webampCI) {
      loadFiles(["/Program Files/Webamp/webamp.bundle.min.js"]).then(
        async () => {
          if (window.Webamp) {
            initWebamp(
              containerRef.current as HTMLDivElement,
              await getUrlOptions()
            );
          }
        }
      );
    }
  }, [getUrlOptions, initWebamp, webampCI]);

  useEffect(() => {
    if (url !== currentUrl) {
      loadWebampUrl();
      setCurrentUrl(url);
    }
  }, [currentUrl, loadWebampUrl, url, webampCI]);

  return (
    <StyledWebamp
      ref={containerRef}
      style={{ zIndex }}
      {...focusableProps}
      {...windowTransitions}
    />
  );
};

export default Webamp;
