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
import useDoubleClick from "hooks/useDoubleClick";
import { basename, extname } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "styles/common/Button";
import {
  HIGH_PRIORITY_ELEMENT,
  ONE_TIME_PASSIVE_EVENT,
  TIFF_IMAGE_FORMATS,
} from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  getGifJs,
  imageToBufferUrl,
  label,
} from "utils/functions";

const { maxScale, minScale } = panZoomConfig;

const aniToGif = async (aniBuffer: Buffer): Promise<Buffer> => {
  const gif = await getGifJs();
  const { parseAni } = await import("ani-cursor/dist/parser");
  let images: Uint8Array[] = [];

  try {
    ({ images } = parseAni(aniBuffer));
  } catch {
    return aniBuffer;
  }

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          const imageIcon = new Image();
          const bufferUrl = bufferToUrl(Buffer.from(image));

          imageIcon.addEventListener(
            "load",
            () => {
              gif.addFrame(imageIcon);
              cleanUpBufferUrl(bufferUrl);
              resolve();
            },
            ONE_TIME_PASSIVE_EVENT
          );
          imageIcon.src = bufferUrl;
        })
    )
  );

  return new Promise((resolve) => {
    gif
      .on("finished", (blob) =>
        blob
          .arrayBuffer()
          .then((arrayBuffer) => resolve(Buffer.from(arrayBuffer)))
      )
      .render();
  });
};

const Photos: FC<ComponentProcessProps> = ({ id }) => {
  const { processes: { [id]: process } = {} } = useProcesses();
  const { closing = false, url = "" } = process || {};
  const [src, setSrc] = useState<Record<string, string>>({});
  const [brokenImage, setBrokenImage] = useState(false);
  const { prependFileToTitle } = useTitle(id);
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
  const loadPhoto = useCallback(async (): Promise<void> => {
    let fileContents: Buffer | string = await readFile(url);
    const ext = extname(url).toLowerCase();

    if ([".ani", ".cur"].includes(ext)) {
      fileContents = await aniToGif(fileContents);
    } else if (TIFF_IMAGE_FORMATS.has(ext)) {
      fileContents = (await import("utif"))
        .bufferToURI(fileContents)
        .replace("data:image/png;base64,", "");
    }

    setSrc((currentSrc) => {
      const [currentUrl] = Object.keys(currentSrc);

      if (currentUrl) {
        if (currentUrl === url) return currentSrc;
        reset?.();
      }

      return { [url]: imageToBufferUrl(url, fileContents) };
    });
    prependFileToTitle(basename(url));
  }, [prependFileToTitle, readFile, reset, url]);
  const style = useMemo<React.CSSProperties>(
    () => ({
      display: src[url] && !brokenImage ? "block" : "none",
    }),
    [brokenImage, src, url]
  );

  useEffect(() => {
    if (url && !src[url] && !closing) loadPhoto();
  }, [closing, loadPhoto, src, url]);

  return (
    <StyledPhotos ref={containerRef} {...useFileDrop({ id })}>
      <nav className="top">
        <Button
          disabled={!url || scale === maxScale || brokenImage}
          onClick={zoomIn}
          {...label("Zoom in")}
        >
          <ZoomIn />
        </Button>
        <Button
          disabled={!url || scale === minScale || brokenImage}
          onClick={zoomOut}
          {...label("Zoom out")}
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
          decoding="async"
          loading="eager"
          onError={() => setBrokenImage(true)}
          onLoad={() => setBrokenImage(false)}
          src={src[url]}
          style={style}
          {...HIGH_PRIORITY_ELEMENT}
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
        <Button
          disabled={!url}
          onClick={toggleFullscreen}
          {...label("Full-screen")}
        >
          {fullscreen ? <ExitFullscreen /> : <Fullscreen />}
        </Button>
      </nav>
    </StyledPhotos>
  );
};

export default Photos;
