import {
  ExitFullscreen,
  Fullscreen,
  ZoomIn,
  ZoomOut,
} from "components/apps/Photos/PhotoIcons";
import StyledPhotos from "components/apps/Photos/StyledPhotos";
import useDragZoom from "components/apps/Photos/useDragZoom";
import useFullscreen from "components/apps/Photos/useFullscreen";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import { EMPTY_BUFFER } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";
import useDoubleClick from "utils/useDoubleClick";

const Photos = ({ id }: ComponentProcessProps): JSX.Element => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const { closing = false, url = "" } = process || {};
  const [src, setSrc] = useState<Record<string, string>>({});
  const { appendFileToTitle } = useTitle(id);
  const { fs } = useFileSystem();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const { dragZoomProps, isMaxZoom, isMinZoom, zoom } = useDragZoom(
    id,
    imageRef,
    imageContainerRef
  );
  const { fullscreen, toggleFullscreen } = useFullscreen(containerRef);

  useEffect(() => {
    if (fs && url && !src[url] && !closing) {
      fs?.readFile(url, (error, contents = EMPTY_BUFFER) => {
        if (!error) {
          setSrc((currentSrc) => {
            const [currentUrl] = Object.keys(currentSrc);

            if (currentUrl) cleanUpBufferUrl(currentUrl);

            return { [url]: bufferToUrl(contents) };
          });
          appendFileToTitle(basename(url));
        }
      });
    }

    return () => cleanUpBufferUrl(src[url]);
  }, [appendFileToTitle, closing, fs, src, url]);

  return (
    <StyledPhotos ref={containerRef} {...useFileDrop({ id })}>
      <nav className="top">
        <Button title="Zoom in" disabled={isMaxZoom} onClick={() => zoom("in")}>
          <ZoomIn />
        </Button>
        <Button
          title="Zoom out"
          disabled={isMinZoom}
          onClick={() => zoom("out")}
        >
          <ZoomOut />
        </Button>
      </nav>
      <figure
        ref={imageContainerRef}
        onWheel={({ deltaY }) => zoom(deltaY < 0 ? "in" : "out")}
        {...useDoubleClick(() => zoom("toggle"))}
      >
        <img
          alt={basename(url, extname(url))}
          ref={imageRef}
          src={src[url]}
          {...dragZoomProps}
        />
      </figure>
      <nav className="bottom">
        <Button title="Full-screen" onClick={toggleFullscreen}>
          {fullscreen ? <ExitFullscreen /> : <Fullscreen />}
        </Button>
      </nav>
    </StyledPhotos>
  );
};

export default Photos;
