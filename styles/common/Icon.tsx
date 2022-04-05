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

let WEBP_SUPPORT: boolean;

const supportsWebP = (): boolean => {
  try {
    WEBP_SUPPORT = document
      .createElement("canvas")
      .toDataURL("image/webp", 0)
      .startsWith("data:image/webp");
  } catch {
    WEBP_SUPPORT = false;
  }

  return WEBP_SUPPORT;
};

const StyledIcon = styled.img.attrs<IconProps>(
  ({ $imgSize = 0, $displaySize = 0, $eager = false, src = "" }) => ({
    decoding: "async",
    draggable: false,
    height: $displaySize > $imgSize ? $imgSize : $displaySize || $imgSize,
    loading: $eager ? "eager" : "lazy",
    src:
      !src ||
      src.startsWith("blob:") ||
      src.startsWith("http:") ||
      src.startsWith("https:") ||
      src.startsWith("data:") ||
      src.endsWith(".ico")
        ? src
        : join(
            dirname(src),
            `${$imgSize}x${$imgSize}`,
            basename(
              WEBP_SUPPORT ?? supportsWebP()
                ? src.replace(".png", ".webp")
                : src
            )
          ),
    width: $displaySize > $imgSize ? $imgSize : $displaySize || $imgSize,
  })
)<IconProps>`
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
  const { $imgRef, src = "" } = props;
  const style = useMemo<React.CSSProperties>(
    () => ({ visibility: loaded ? "visible" : "hidden" }),
    [loaded]
  );

  useEffect(
    () => () => {
      if (loaded && src.startsWith("blob:")) cleanUpBufferUrl(src);
    },
    [loaded, src]
  );

  return (
    <StyledIcon
      ref={$imgRef}
      onLoad={() => setLoaded(true)}
      style={style}
      {...props}
    />
  );
};

export default memo(Icon);
