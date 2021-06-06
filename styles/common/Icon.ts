import { basename, dirname } from 'path';
import styled from 'styled-components';
import { cleanUpBufferUrl } from 'utils/functions';

const onLoad: React.ReactEventHandler<HTMLImageElement> = ({ target }) => {
  const img = target as HTMLImageElement;

  img.style.setProperty('visibility', 'visible');

  if (img.src.startsWith('blob:')) cleanUpBufferUrl(img.src);
};

export type IconProps = {
  imgSize: number;
  displaySize?: number;
};

const Icon = styled.img.attrs<IconProps>(
  ({ imgSize, displaySize, src = '' }) => ({
    draggable: false,
    height: `${displaySize || imgSize}px`,
    onLoad,
    src:
      !src || src.startsWith('blob:')
        ? src
        : `${dirname(src)}/${imgSize}x${imgSize}/${basename(src)}`,
    width: `${displaySize || imgSize}px`
  })
)<IconProps>`
  visibility: hidden;
`;

export default Icon;
