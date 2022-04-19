import { basename, dirname, join } from "path";
import { memo, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { UNKNOWN_ICON } from "utils/constants";
import { cleanUpBufferUrl, supportsWebP } from "utils/functions";

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
  .attrs<IconProps>(
    ({ $imgSize = 0, $displaySize = 0, $eager = false, src = "" }) => ({
      decoding: "async",
      draggable: false,
      fetchpriority: $eager ? "high" : undefined,
      height: $displaySize > $imgSize ? $imgSize : $displaySize || $imgSize,
      loading: $eager ? "eager" : undefined,
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
              basename(!supportsWebP() ? src.replace(".webp", ".png") : src)
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

const Icon: FC<IconProps & React.ImgHTMLAttributes<HTMLImageElement>> = ({
  src = "",
  ...props
}) => {
  const [loadedSrc, setLoadedSrc] = useState("");
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const { $imgRef } = props;
  const style = useMemo<React.CSSProperties>(
    () => ({ visibility: loadedSrc ? "visible" : "hidden" }),
    [loadedSrc]
  );

  useEffect(
    () => () => {
      if (loadedSrc && src.startsWith("blob:")) cleanUpBufferUrl(src);
    },
    [loadedSrc, src]
  );

  return (
    <StyledIcon
      ref={$imgRef}
      onError={() => {
        if (src) {
          setBrokenImages((currentBrokenImages) => [
            ...currentBrokenImages,
            src,
          ]);
        }
      }}
      onLoad={() => {
        if (!brokenImages.includes(src)) setLoadedSrc(src);
      }}
      src={brokenImages.includes(src) ? loadedSrc || UNKNOWN_ICON : src}
      style={style}
      {...props}
    />
  );
};

export default memo(Icon);
