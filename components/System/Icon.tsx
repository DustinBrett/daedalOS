import DoomImage from '@/public/icons/games/doom.png';
import DosImage from '@/public/icons/programs/dos.png';
import ExplorerImage from '@/public/icons/programs/explorer.png';
import JsFileImage from '@/public/icons/files/js.svg';
import KeenImage from '@/public/icons/games/keen.png';
import UnknownFileImage from '@/public/icons/files/unknown.svg';
import WinampImage from '@/public/icons/programs/winamp.png';

import Img from 'react-optimized-image';
import { basename } from 'path';
import { memo } from 'react';

type IconProps = { height: number, src: string, width: number };

const Icon: React.FC<IconProps> = ({ src, width, height }) => {
  const dimensions = { width, height };

  switch (src) {
    case '/icons/files/js.svg':
      return <Img url {...dimensions} src={JsFileImage} alt="JavaScript" />;
    case '/icons/files/unknown.svg':
      return <Img url {...dimensions} src={UnknownFileImage} alt="Unknown" />;
    case '/icons/programs/dos.png':
      return <Img url {...dimensions} src={DosImage} alt="DOS" />;

    case '/icons/games/keen.png':
      return <Img {...dimensions} src={KeenImage} alt="Commander Keen" type="icon" />;
    case '/icons/games/doom.png':
      return <Img {...dimensions} src={DoomImage} alt="Doom" type="icon" />;
    case '/icons/programs/explorer.png':
      return <Img {...dimensions} src={ExplorerImage} alt="Explorer" type="icon" />;
    case '/icons/programs/winamp.png':
      return <Img {...dimensions} src={WinampImage} alt="Winamp" type="icon" />;

    default:
      return <img {...dimensions} src={src} alt={basename(src)} />;
  }
};

export default memo(Icon);
