import { basename, dirname, extname, join } from "path";
import { useEffect, useState } from "react";
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
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import { useViewport } from "contexts/viewport";
import useDoubleClick from "hooks/useDoubleClick";
import Button from "styles/common/Button";
import {
  HIGH_PRIORITY_ELEMENT,
  IMAGE_FILE_EXTENSIONS,
  NATIVE_IMAGE_FORMATS,
} from "utils/constants";
import {
  bufferToUrl,
  getExtension,
  getMimeType,
  haltEvent,
  label,
} from "utils/functions";
import { loadImageDecoder } from "utils/loaders";

const { maxScale, minScale } = panZoomConfig;

const Photos: FC<ComponentProcessProps> = ({ id }) => {
  const { url: setUrl } = useProcessesActions();
  const { closing = false, componentWindow, url = "" } = useProcess(id);
  const [src, setSrc] = useState<Record<string, string>>({});
  const [brokenImage, setBrokenImage] = useState(false);
  const { prependFileToTitle } = useTitle(id);
  const { readdir, readFile } = useFileSystemActions();
  const [container, setContainer] = useState<HTMLDivElement | null>();
  const [image, setImage] = useState<HTMLImageElement | null>();
  const [imageContainer, setImageContainer] = useState<HTMLElement | null>();
  const { reset, scale, zoomIn, zoomOut, zoomToPoint } = usePanZoom(
    id,
    image,
    imageContainer
  );
  const { fullscreenElement, toggleFullscreen } = useViewport();
  const loadPhoto = async (): Promise<void> => {
    const ext = getExtension(url);
    const isNative = NATIVE_IMAGE_FORMATS.has(ext);
    const [initialContents, decoder] = await Promise.all([
      readFile(url),
      isNative
        ? Promise.resolve()
        : loadImageDecoder().then((m) => m.decodeImageToBuffer),
    ]);
    let fileContents = initialContents;

    if (!isNative && decoder) {
      const decodedData = await decoder(ext, fileContents);

      if (decodedData) fileContents = decodedData;
    }

    setSrc((currentSrc) => {
      const [currentUrl] = Object.keys(currentSrc);

      if (currentUrl) {
        if (currentUrl === url) return currentSrc;
        reset?.();
      }

      return {
        [url]: bufferToUrl(fileContents, getMimeType(url)),
      };
    });
    prependFileToTitle(basename(url));
  };
  const onKeyDown = async ({ key }: KeyboardEvent): Promise<void> => {
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
  };
  const isFullscreen = Boolean(container) && fullscreenElement === container;

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- False positive: state is only set after an await
    if (url && !src[url] && !closing) loadPhoto();
  }, [closing, loadPhoto, src, url]);

  useEffect(() => {
    componentWindow?.addEventListener("keydown", onKeyDown);

    return () => componentWindow?.removeEventListener("keydown", onKeyDown);
  }, [componentWindow, onKeyDown]);

  return (
    <StyledPhotos
      ref={setContainer}
      $showImage={Boolean(src[url] && !brokenImage)}
      className={url ? "" : "drop"}
      onContextMenu={haltEvent}
      {...useFileDrop({ id })}
    >
      <nav className="top" role="presentation">
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
        ref={setImageContainer}
        {...useDoubleClick((event) => {
          if (scale === minScale) {
            zoomToPoint?.(minScale * 2, event, { animate: true });
          } else {
            reset?.();
          }
        })}
      >
        <img
          ref={setImage}
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
      <nav className="bottom" role="presentation">
        <Button
          disabled={!url}
          onClick={() => toggleFullscreen(container, "show")}
          {...label(isFullscreen ? "Exit full-screen" : "Full-screen")}
        >
          {isFullscreen ? <ExitFullscreen /> : <Fullscreen />}
        </Button>
      </nav>
    </StyledPhotos>
  );
};

export default Photos;
