import { basename, extname } from "path";
import { useEffect, useRef, useState } from "react";
import { type Options } from "webamp";
import {
  cleanBufferOnSkinLoad,
  focusWindow,
  parseTrack,
  tracksFromPlaylist,
  unFocus,
} from "components/apps/Webamp/functions";
import StyledWebamp from "components/apps/Webamp/StyledWebamp";
import useWebamp from "components/apps/Webamp/useWebamp";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import { AUDIO_PLAYLIST_EXTENSIONS } from "utils/constants";
import { bufferToUrl, getExtension, loadFiles } from "utils/functions";

const Webamp: FC<ComponentProcessProps> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { readFile } = useFileSystemActions();
  const { url: setUrl } = useProcessesActions();
  const { libs = [], minimized = false, url = "" } = useProcess(id);
  const [loadedUrl, setLoadedUrl] = useState(url);
  const { initWebamp, webampCI } = useWebamp(id);
  const windowTransitions = useWindowTransitions(id, undefined, true);
  const focusEvents = {
    onBlurCapture: () => webampCI && unFocus(webampCI),
    onFocusCapture: () => webampCI && focusWindow(webampCI, "main"),
  };
  const { zIndex, ...focusableProps } = useFocusable(id, focusEvents);
  const getUrlOptions = async (): Promise<Options> => {
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
  };
  const loadWebampUrl = async (): Promise<void> => {
    if (webampCI) {
      const { initialSkin, initialTracks } = await getUrlOptions();

      if (initialTracks) webampCI.setTracksToPlay(initialTracks);
      else if (initialSkin) {
        cleanBufferOnSkinLoad(webampCI, initialSkin.url);
        webampCI.setSkinFromUrl(initialSkin.url);
      }
    }
  };
  const loadingWebamp = useRef(false);

  useEffect(() => {
    if (containerRef.current && !webampCI) {
      loadFiles(libs).then(async () => {
        // Without Web Audio (Playwright's Windows WebKit) its constructor throws
        if (window.Webamp?.browserIsSupported() && !loadingWebamp.current) {
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
      // eslint-disable-next-line react/set-state-in-effect -- Consumes each new url once
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

export default Webamp;
