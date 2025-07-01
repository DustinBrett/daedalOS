import { basename, extname } from "path";
import { type Options } from "webamp";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import StyledWebamp from "components/apps/Webamp/StyledWebamp";
import {
  cleanBufferOnSkinLoad,
  focusWindow,
  parseTrack,
  tracksFromPlaylist,
  unFocus,
} from "components/apps/Webamp/functions";
import useWebamp from "components/apps/Webamp/useWebamp";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { AUDIO_PLAYLIST_EXTENSIONS } from "utils/constants";
import { bufferToUrl, getExtension, loadFiles } from "utils/functions";

const Webamp: FC<ComponentProcessProps> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { readFile } = useFileSystem();
  const {
    processes: { [id]: { libs = [], minimized = false, url = "" } = {} } = {},
    url: setUrl,
  } = useProcesses();
  const [loadedUrl, setLoadedUrl] = useState(url);
  const { initWebamp, webampCI } = useWebamp(id);
  const windowTransitions = useWindowTransitions(id, true);
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
      const extension = getExtension(url);

      if (AUDIO_PLAYLIST_EXTENSIONS.has(extension)) {
        const initialTracks = await tracksFromPlaylist(
          (await readFile(url)).toString(),
          extension,
          basename(url, extname(url))
        );

        return initialTracks.length > 0 ? { initialTracks } : {};
      }

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
  const loadingWebamp = useRef(false);

  useEffect(() => {
    if (containerRef.current && !webampCI) {
      loadFiles(libs).then(async () => {
        if (window.Webamp && !loadingWebamp.current) {
          loadingWebamp.current = true;

          initWebamp(
            containerRef.current as HTMLDivElement,
            await getUrlOptions()
          );
        }
      });
    }
  }, [getUrlOptions, initWebamp, libs, webampCI]);

  useEffect(() => {
    if (url !== loadedUrl) {
      loadWebampUrl();
      setLoadedUrl(url);
    } else if (url) {
      setUrl(id, "");
      setLoadedUrl("");
    }
  }, [id, loadWebampUrl, loadedUrl, setUrl, url]);

  return (
    <StyledWebamp
      ref={containerRef}
      $minimized={minimized}
      $zIndex={zIndex}
      {...focusableProps}
      {...windowTransitions}
    />
  );
};

export default memo(Webamp);
