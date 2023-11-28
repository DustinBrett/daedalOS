import { forwardRef, memo, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  ICON_CACHE,
  SUPPORTED_ICON_PIXEL_RATIOS,
  YT_ICON_CACHE,
} from "utils/constants";
import {
  cleanUpBufferUrl,
  createFallbackSrcSet,
  imageSrc,
  imageSrcs,
} from "utils/functions";

export type IconProps = {
  $eager?: boolean;
  $moving?: boolean;
  displaySize?: number;
  imgSize: number;
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
    fetchpriority: $eager ? "high" : undefined,
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

const Icon = forwardRef<
  HTMLImageElement,
  IconProps & React.ImgHTMLAttributes<HTMLImageElement>
>((props, ref) => {
  const [loaded, setLoaded] = useState(false);
  const { displaySize = 0, imgSize = 0, src = "", ...componentProps } = props;
  const isStaticIcon =
    !src ||
    src.startsWith("blob:") ||
    src.startsWith("http:") ||
    src.startsWith("https:") ||
    src.startsWith("data:") ||
    src.startsWith(ICON_CACHE) ||
    src.startsWith(YT_ICON_CACHE) ||
    src.endsWith(".ico");
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

  useEffect(
    () => () => {
      if (loaded && src.startsWith("blob:")) cleanUpBufferUrl(src);
    },
    [loaded, src]
  );

  const RenderedIcon = (
    <StyledIcon
      ref={ref}
      $loaded={loaded}
      onError={({ target }) => {
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
      }}
      onLoad={() => setLoaded(true)}
      src={isStaticIcon ? src : imageSrc(src, imgSize, 1, ".png")}
      srcSet={
        isStaticIcon
          ? undefined
          : imageSrcs(src, imgSize, ".png", failedUrls) ||
            (failedUrls.length === 0
              ? ""
              : createFallbackSrcSet(src, failedUrls))
      }
      {...componentProps}
      {...dimensionProps}
    />
  );

  return (
    <picture>
      {!isStaticIcon &&
        SUPPORTED_ICON_PIXEL_RATIOS.map((ratio) => {
          const srcSet = imageSrc(src, imgSize, ratio, ".webp");
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
              type="image/webp"
            />
          );
        })}
      {RenderedIcon}
    </picture>
  );
});

export default memo(Icon);
