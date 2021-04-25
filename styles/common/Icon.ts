import { basename, dirname } from 'path';
import styled from 'styled-components';
import { cleanUpBufferUrl } from 'utils/functions';

const onLoad: React.ReactEventHandler<HTMLImageElement> = ({ target }) => {
  const img = target as HTMLImageElement;

  img.style.setProperty('visibility', 'visible');

  if (img.src.startsWith('blob:')) cleanUpBufferUrl(img.src);
};

type IconProps = { size: number };

const Icon = styled.img.attrs<IconProps>(({ size, src = '' }) => ({
  draggable: false,
  height: `${size}px`,
  onLoad,
  src:
    !src || src.startsWith('blob:')
      ? src
      : `${dirname(src)}/${size}x${size}/${basename(src)}`,
  width: `${size}px`
}))<IconProps>`
  visibility: hidden;
`;

export default Icon;
