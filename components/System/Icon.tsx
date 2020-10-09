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

const Icon: React.FC<{ src: string }> = ({ src }) => {
  switch (src) {
    case '/icons/files/js.svg':
      return <Img src={JsFileImage} alt="JavaScript" url />;
    case '/icons/files/unknown.svg':
      return <Img src={UnknownFileImage} alt="Unknown" url />;
    case '/icons/games/doom.png':
      return <Img src={DoomImage} alt="Doom" type="icon" />;
    case '/icons/games/keen.png':
      return <Img src={KeenImage} alt="Commander Keen" type="icon" />;
    case '/icons/programs/dos.png':
      return <Img src={DosImage} alt="DOS" url />;
    case '/icons/programs/explorer.png':
      return <Img src={ExplorerImage} alt="Explorer" type="icon" />;
    case '/icons/programs/winamp.png':
      return <Img src={WinampImage} alt="Winamp" type="icon" />;
    default:
      return <img alt={basename(src)} src={src} />;
  }
};

export default memo(Icon);
