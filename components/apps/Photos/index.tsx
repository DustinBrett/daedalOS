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
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";
import useDoubleClick from "utils/useDoubleClick";

const { maxScale, minScale } = panZoomConfig;

const Photos = ({ id }: ComponentProcessProps): JSX.Element => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const { closing = false, url = "" } = process || {};
  const [src, setSrc] = useState<Record<string, string>>({});
  const [brokenImage, setBrokenImage] = useState(false);
  const { appendFileToTitle } = useTitle(id);
  const { readFile } = useFileSystem();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const { reset, scale, zoomIn, zoomOut, zoomToPoint } = usePanZoom(
    id,
    imageRef.current,
    imageContainerRef.current
  );
  const { fullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const loadPhoto = useCallback(async () => {
    const fileContents = await readFile(url);

    setSrc((currentSrc) => {
      const [currentUrl] = Object.keys(currentSrc);

      if (currentUrl) {
        cleanUpBufferUrl(currentUrl);
        reset?.();
      }

      return { [url]: bufferToUrl(fileContents) };
    });
    appendFileToTitle(basename(url));
  }, [appendFileToTitle, readFile, reset, url]);

  useEffect(() => {
    if (url && !src[url] && !closing) loadPhoto();

    return () => {
      if (closing) cleanUpBufferUrl(src[url]);
    };
  }, [closing, loadPhoto, src, url]);

  return (
    <StyledPhotos ref={containerRef} {...useFileDrop({ id })}>
      <nav className="top">
        <Button
          disabled={!url || scale === maxScale || brokenImage}
          onClick={zoomIn}
          title="Zoom in"
        >
          <ZoomIn />
        </Button>
        <Button
          disabled={!url || scale === minScale || brokenImage}
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
        <img
          ref={imageRef}
          alt={basename(url, extname(url))}
          onError={() => setBrokenImage(true)}
          onLoad={() => setBrokenImage(false)}
          src={src[url]}
          style={{
            display: src[url] && !brokenImage ? "block" : "none",
          }}
        />
        {brokenImage && (
          <div>
            {basename(url)}
            <br />
            Sorry, Photos can&apos;t open this file because the format is
            currently unsupported, or the file is corrupted
          </div>
        )}
      </figure>
      <nav className="bottom">
        <Button disabled={!url} onClick={toggleFullscreen} title="Full-screen">
          {fullscreen ? <ExitFullscreen /> : <Fullscreen />}
        </Button>
      </nav>
    </StyledPhotos>
  );
};

export default Photos;
