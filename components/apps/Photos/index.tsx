import {
  ExitFullscreen,
  Fullscreen,
  ZoomIn,
  ZoomOut,
} from "components/apps/Photos/PhotoIcons";
import StyledPhotos from "components/apps/Photos/StyledPhotos";
import useFullscreen from "components/apps/Photos/useFullscreen";
import usePanZoom, { panZoomConfig } from "components/apps/Photos/usePanZoom";
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

const { maxScale, minScale } = panZoomConfig;

const Photos = ({ id }: ComponentProcessProps): JSX.Element => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const { closing = false, url = "" } = process || {};
  const [src, setSrc] = useState<Record<string, string>>({});
  const { appendFileToTitle } = useTitle(id);
  const { fs } = useFileSystem();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const { reset, scale, zoomIn, zoomOut, zoomToPoint } = usePanZoom(
    id,
    imageRef.current,
    imageContainerRef.current
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
        <Button disabled={scale === maxScale} onClick={zoomIn} title="Zoom in">
          <ZoomIn />
        </Button>
        <Button
          disabled={scale === minScale}
          onClick={zoomOut}
          title="Zoom out"
        >
          <ZoomOut />
        </Button>
      </nav>
      <figure
        ref={imageContainerRef}
        {...useDoubleClick((event) => {
          if (scale === minScale) {
            zoomToPoint?.(minScale * 2, event, { animate: true });
          } else {
            reset?.();
          }
        })}
      >
        {src[url] && (
          <img
            ref={imageRef}
            alt={basename(url, extname(url))}
            src={src[url]}
          />
        )}
      </figure>
      <nav className="bottom">
        <Button onClick={toggleFullscreen} title="Full-screen">
          {fullscreen ? <ExitFullscreen /> : <Fullscreen />}
        </Button>
      </nav>
    </StyledPhotos>
  );
};

export default Photos;
