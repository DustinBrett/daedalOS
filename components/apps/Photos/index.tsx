import { basename, dirname, extname, join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExitFullscreen,
  Fullscreen,
  ZoomIn,
  ZoomOut,
} from "components/apps/Photos/PhotoIcons";
import StyledPhotos from "components/apps/Photos/StyledPhotos";
import usePanZoom, { panZoomConfig } from "components/apps/Photos/usePanZoom";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useViewport } from "contexts/viewport";
import useDoubleClick from "hooks/useDoubleClick";
import Button from "styles/common/Button";
import {
  HIGH_PRIORITY_ELEMENT,
  IMAGE_FILE_EXTENSIONS,
  ONE_TIME_PASSIVE_EVENT,
  TIFF_IMAGE_FORMATS,
} from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  decodeJxl,
  getExtension,
  getGifJs,
  haltEvent,
  hasJxlSupport,
  imageToBufferUrl,
  imgDataToBuffer,
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
  const { processes: { [id]: process } = {}, url: setUrl } = useProcesses();
  const { componentWindow, closing = false, url = "" } = process || {};
  const [src, setSrc] = useState<Record<string, string>>({});
  const [brokenImage, setBrokenImage] = useState(false);
  const { prependFileToTitle } = useTitle(id);
  const { readFile, readdir } = useFileSystem();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const { reset, scale, zoomIn, zoomOut, zoomToPoint } = usePanZoom(
    id,
    imageRef.current,
    imageContainerRef.current
  );
  const { fullscreenElement, toggleFullscreen } = useViewport();
  const loadPhoto = useCallback(async (): Promise<void> => {
    let fileContents: Buffer | string = await readFile(url);
    const ext = getExtension(url);

    if ([".ani", ".cur"].includes(ext)) {
      fileContents = await aniToGif(fileContents);
    } else if (ext === ".jxl" && !(await hasJxlSupport())) {
      fileContents = imgDataToBuffer(await decodeJxl(fileContents));
    } else if (ext === ".qoi") {
      const { decodeQoi } = await import("components/apps/Photos/qoi");

      fileContents = decodeQoi(fileContents);
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
  const onKeyDown = useCallback(
    async ({ key }: KeyboardEvent): Promise<void> => {
      // eslint-disable-next-line default-case
      switch (key) {
        case "ArrowRight":
        case "ArrowLeft": {
          const directory = await readdir(dirname(url));
          const currentIndex = directory.indexOf(basename(url));
          const nextPhoto = (index: number, next: boolean): void => {
            if (index === -1) return;

            const nextIndex = index + (next ? 1 : -1);

            if (nextIndex === -1 || nextIndex === directory.length) {
              return;
            }

            const nextUrl = directory[nextIndex];

            if (IMAGE_FILE_EXTENSIONS.has(getExtension(nextUrl))) {
              setUrl(id, join(dirname(url), nextUrl));
            } else {
              nextPhoto(nextIndex, next);
            }
          };

          nextPhoto(currentIndex, key === "ArrowRight");

          break;
        }
      }
    },
    [id, readdir, setUrl, url]
  );

  useEffect(() => {
    if (url && !src[url] && !closing) loadPhoto();
  }, [closing, loadPhoto, src, url]);

  useEffect(() => {
    componentWindow?.addEventListener("keydown", onKeyDown);

    return () => componentWindow?.removeEventListener("keydown", onKeyDown);
  }, [componentWindow, onKeyDown]);

  return (
    <StyledPhotos
      ref={containerRef}
      $showImage={Boolean(src[url] && !brokenImage)}
      onContextMenu={haltEvent}
      {...useFileDrop({ id })}
    >
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
          onClick={() => toggleFullscreen(containerRef.current, "show")}
          {...label("Full-screen")}
        >
          {fullscreenElement === containerRef.current ? (
            <ExitFullscreen />
          ) : (
            <Fullscreen />
          )}
        </Button>
      </nav>
    </StyledPhotos>
  );
};

export default Photos;
