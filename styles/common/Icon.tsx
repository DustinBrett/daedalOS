import { basename, dirname } from "path";
import { memo, useEffect } from "react";
import styled from "styled-components";
import { cleanUpBufferUrl } from "utils/functions";

export type IconProps = {
  displaySize?: number;
  imgSize: number;
};

const onLoad: React.ReactEventHandler = ({ target }) =>
  (target as HTMLImageElement).style.setProperty("visibility", "visible");

const StyledIcon = styled.img.attrs<IconProps>(
  ({ imgSize, displaySize, src = "" }) => ({
    draggable: false,
    height: `${displaySize || imgSize}px`,
    onLoad,
    src:
      !src || src.startsWith("blob:")
        ? src
        : `${dirname(src)}/${imgSize}x${imgSize}/${basename(src)}`,
    width: `${displaySize || imgSize}px`,
  })
)<IconProps>`
  visibility: hidden;
`;

const Icon = (
  props: React.ImgHTMLAttributes<HTMLImageElement> & IconProps
): JSX.Element => {
  useEffect(
    () => () => {
      if (props?.src?.startsWith("blob:")) cleanUpBufferUrl(props?.src);
    },
    [props]
  );

  return <StyledIcon {...props} />;
};

export default memo(Icon);
