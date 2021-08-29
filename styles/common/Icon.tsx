import { basename, dirname, join } from "path";
import { memo, useEffect } from "react";
import styled from "styled-components";
import { cleanUpBufferUrl } from "utils/functions";

export type IconProps = {
  displaySize?: number;
  imgSize: number;
  moving?: boolean;
};

const onLoad: React.ReactEventHandler = ({ target }) =>
  (target as HTMLImageElement).style.setProperty("visibility", "visible");

const StyledIcon = styled.img.attrs<IconProps>(
  ({ imgSize, displaySize, src = "" }) => ({
    draggable: false,
    height: displaySize || imgSize,
    onLoad,
    src:
      !src || src.startsWith("blob:")
        ? src
        : join(dirname(src), `${imgSize}x${imgSize}`, basename(src)),
    width: displaySize || imgSize,
  })
)<IconProps>`
  object-fit: contain;
  opacity: ${({ moving }) => (moving ? 0.5 : 1)};
  visibility: hidden;
`;

const Icon = (
  props: React.ImgHTMLAttributes<HTMLImageElement> & IconProps
): JSX.Element => {
  useEffect(
    () => () => {
      if (props.src?.startsWith("blob:")) cleanUpBufferUrl(props.src);
    },
    [props]
  );

  return <StyledIcon {...props} />;
};

export default memo(Icon);
