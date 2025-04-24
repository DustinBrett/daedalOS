import { memo, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { SUPPORTED_ICON_PIXEL_RATIOS } from "utils/constants";
import {
  cleanUpBufferUrl,
  createFallbackSrcSet,
  getExtension,
  getMimeType,
  imageSrc,
  imageSrcs,
  isDynamicIcon,
  supportsWebp,
} from "utils/functions";

export type IconProps = {
  $eager?: boolean;
  $moving?: boolean;
  displaySize?: number;
  imgSize: number;
  singleSrc?: boolean;
  src?: string;
};

type StyledIconProps = Pick<IconProps, "$eager" | "$moving"> & {
  $height: number;
  $loaded: boolean;
  $offset: number | string;
  $width: number;
};

const StyledIcon = styled.img.attrs<StyledIconProps>(
  ({ $eager = false, $height, $width }) => ({
    decoding: "async",
    draggable: false,
    fetchPriority: $eager ? "high" : undefined,
    height: $height,
    loading: $eager ? "eager" : "lazy",
    width: $width,
  })
)<StyledIconProps>`
  aspect-ratio: 1;
  left: ${({ $offset }) => $offset || undefined};
  max-height: ${({ $height }) => $height}px;
  max-width: ${({ $width }) => $width}px;
  min-height: ${({ $height }) => $height}px;
  min-width: ${({ $width }) => $width}px;
  object-fit: contain;
  opacity: ${({ $moving }) => ($moving ? "50%" : "100%")};
  pointer-events: none;
  top: ${({ $offset }) => $offset || undefined};
  visibility: ${({ $loaded }) => ($loaded ? "visible" : "hidden")};
`;

const Icon: FCWithRef<
  HTMLImageElement,
  IconProps & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">
> = ({
  displaySize = 0,
  imgSize = 0,
  ref,
  singleSrc = false,
  src = "",
  ...componentProps
}) => {
  const [loaded, setLoaded] = useState(false);
  const isDynamic = isDynamicIcon(src);
  const imgSrc = useMemo(
    () =>
      isDynamic && !supportsWebp()
        ? src.replace(getExtension(src), ".png")
        : src,
    [isDynamic, src]
  );
  const srcExt = getExtension(imgSrc);
  const dimensionProps = useMemo(() => {
    const size = displaySize > imgSize ? imgSize : displaySize || imgSize;
    const $offset = displaySize > imgSize ? `${displaySize - imgSize}px` : 0;

    return {
      $height: size,
      $offset,
      $width: size,
    };
  }, [displaySize, imgSize]);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const onError: React.ReactEventHandler<HTMLImageElement> = useCallback(
    ({ target }) => {
      const { currentSrc = "" } = (target as HTMLImageElement) || {};

      try {
        const { pathname } = new URL(currentSrc);

        if (pathname && !failedUrls.includes(pathname)) {
          setFailedUrls((currentFailedUrls) => [
            ...currentFailedUrls,
            pathname,
          ]);
        }
      } catch {
        // Ignore failure to log failed url
      }
    },
    [failedUrls]
  );
  const onLoad: React.ReactEventHandler<HTMLImageElement> = useCallback(
    () => setLoaded(true),
    []
  );

  useEffect(
    () => () => {
      if (loaded && src.startsWith("blob:")) cleanUpBufferUrl(src);
    },
    [loaded, src]
  );

  return (
    <picture>
      {!singleSrc &&
        isDynamic &&
        SUPPORTED_ICON_PIXEL_RATIOS.map((ratio) => {
          const srcSet = imageSrc(imgSrc, imgSize, ratio, srcExt);
          const mediaRatio = ratio - 0.99;

          if (
            failedUrls.length > 0 &&
            failedUrls.includes(srcSet.split(" ")[0])
          ) {
            // eslint-disable-next-line unicorn/no-null
            return null;
          }

          return (
            <source
              key={ratio}
              media={
                ratio > 1
                  ? `(min-resolution: ${mediaRatio}x), (-webkit-min-device-pixel-ratio: ${mediaRatio})`
                  : undefined
              }
              srcSet={srcSet}
              type={getMimeType(srcExt)}
            />
          );
        })}
      <StyledIcon
        ref={ref}
        $loaded={loaded}
        onError={onError}
        onLoad={onLoad}
        src={
          isDynamic ? imageSrc(imgSrc, imgSize, 1, srcExt) : src || undefined
        }
        srcSet={
          !singleSrc && isDynamic
            ? imageSrcs(imgSrc, imgSize, srcExt, failedUrls) ||
              (failedUrls.length === 0
                ? ""
                : createFallbackSrcSet(imgSrc, failedUrls))
            : undefined
        }
        {...componentProps}
        {...dimensionProps}
      />
    </picture>
  );
};

export default memo(Icon);
