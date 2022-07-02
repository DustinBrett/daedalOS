import { basename, dirname, join } from "path";
import { memo, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { cleanUpBufferUrl } from "utils/functions";

export type IconProps = {
  $displaySize?: number;
  $eager?: boolean;
  $imgRef?: React.MutableRefObject<HTMLImageElement | null>;
  $imgSize: number;
  $moving?: boolean;
};

const StyledIcon = styled.img
  .withConfig({
    shouldForwardProp: (prop, defaultValidatorFn) =>
      ["fetchpriority"].includes(prop) || defaultValidatorFn(prop),
  })
  .attrs<IconProps>(({ $imgSize = 0, $displaySize = 0, $eager = false }) => ({
    decoding: "async",
    draggable: false,
    fetchpriority: $eager ? "high" : undefined,
    height: $displaySize > $imgSize ? $imgSize : $displaySize || $imgSize,
    loading: $eager ? "eager" : undefined,
    width: $displaySize > $imgSize ? $imgSize : $displaySize || $imgSize,
  }))<IconProps>`
  left: ${({ $displaySize = 0, $imgSize = 0 }) =>
    $displaySize > $imgSize ? `${$displaySize - $imgSize}px` : undefined};
  object-fit: contain;
  opacity: ${({ $moving }) => ($moving ? 0.5 : 1)};
  top: ${({ $displaySize = 0, $imgSize = 0 }) =>
    $displaySize > $imgSize ? `${$displaySize - $imgSize}px` : undefined};
`;

const Icon: FC<IconProps & React.ImgHTMLAttributes<HTMLImageElement>> = (
  props
) => {
  const [loaded, setLoaded] = useState(false);
  const { $imgRef, src = "", ...componentProps } = props;
  const style = useMemo<React.CSSProperties>(
    () => ({ visibility: loaded ? "visible" : "hidden" }),
    [loaded]
  );
  const isStaticIcon =
    !src ||
    src.startsWith("blob:") ||
    src.startsWith("http:") ||
    src.startsWith("https:") ||
    src.startsWith("data:") ||
    src.endsWith(".ico");
  const baseDirName = dirname(src);
  const baseFileName = basename(src, ".webp");
  const imgSrc = (size: number, ratio: number, extension: string): string =>
    `${join(
      baseDirName,
      `${size * ratio}x${size * ratio}`,
      `${baseFileName}${extension}`
    )}${ratio > 1 ? ` ${ratio}x` : ""}`;
  const { $imgSize } = props;
  const imgSrcs = (extension = ".webp"): string =>
    `${imgSrc($imgSize, 1, extension)},
    ${imgSrc($imgSize, 2, extension)},
    ${imgSrc($imgSize, 3, extension)}`;

  useEffect(
    () => () => {
      if (loaded && src.startsWith("blob:")) cleanUpBufferUrl(src);
    },
    [loaded, src]
  );

  const RenderedIcon = (
    <StyledIcon
      ref={$imgRef}
      onLoad={() => setLoaded(true)}
      src={isStaticIcon ? src : undefined}
      srcSet={!isStaticIcon ? imgSrcs(".png") : undefined}
      style={style}
      {...componentProps}
    />
  );

  if (isStaticIcon) return RenderedIcon;

  return (
    <picture>
      <source srcSet={imgSrcs(".avif")} type="image/avif" />
      <source srcSet={imgSrcs(".webp")} type="image/webp" />
      {RenderedIcon}
    </picture>
  );
};

export default memo(Icon);
