import { basename, dirname, join } from "path";
import { memo, useEffect, useState } from "react";
import styled from "styled-components";
import { cleanUpBufferUrl } from "utils/functions";

export type IconProps = {
  displaySize?: number;
  imgRef?: React.RefObject<HTMLImageElement>;
  imgSize: number;
  moving?: boolean;
};

const StyledIcon = styled.img.attrs<IconProps>(
  ({ imgSize = 0, displaySize = 0, src = "" }) => ({
    draggable: false,
    height: displaySize > imgSize ? imgSize : displaySize || imgSize,
    src:
      !src ||
      src.startsWith("blob:") ||
      src.startsWith("http:") ||
      src.startsWith("https:") ||
      src.endsWith(".ico")
        ? src
        : join(dirname(src), `${imgSize}x${imgSize}`, basename(src)),
    width: displaySize > imgSize ? imgSize : displaySize || imgSize,
  })
)<IconProps>`
  left: ${({ displaySize = 0, imgSize = 0 }) =>
    displaySize > imgSize ? `${displaySize - imgSize}px` : undefined};
  object-fit: contain;
  opacity: ${({ moving }) => (moving ? 0.5 : 1)};
  top: ${({ displaySize = 0, imgSize = 0 }) =>
    displaySize > imgSize ? `${displaySize - imgSize}px` : undefined};
`;

const Icon = (
  props: IconProps & React.ImgHTMLAttributes<HTMLImageElement>
): JSX.Element => {
  const [loaded, setLoaded] = useState(false);
  const { imgRef, src = "" } = props;

  useEffect(
    () => () => {
      if (loaded && src.startsWith("blob:")) cleanUpBufferUrl(src);
    },
    [loaded, src]
  );

  return (
    <StyledIcon
      ref={imgRef}
      onLoad={() => setLoaded(true)}
      style={{ visibility: loaded ? "visible" : "hidden" }}
      {...props}
    />
  );
};

export default memo(Icon);
