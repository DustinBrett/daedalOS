import styled from 'styled-components';
import { cleanUpBufferUrl } from 'utils/functions';

const onLoad: React.ReactEventHandler<HTMLImageElement> = ({ target }) => {
  const img = target as HTMLImageElement;

  img.style.setProperty('visibility', 'visible');

  if (img.src.startsWith('blob:')) cleanUpBufferUrl(img.src);
};

const Image = styled.img.attrs({
  draggable: false,
  onLoad
})`
  visibility: hidden;
`;

export default Image;
