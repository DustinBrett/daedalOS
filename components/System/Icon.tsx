import Image from 'next/image';
import { basename } from 'path';
import { memo } from 'react';

type IconProps = { height: number; src: string; width: number };

// TODO: Pass `alt`
const Icon: React.FC<IconProps> = ({ src, width, height }) => {
  const size = { width, height };

  switch (src) {
    case '/icons/files/js.svg':
      return (
        <Image
          unoptimized
          {...size}
          src="/icons/files/js.svg"
          alt="JavaScript"
        />
      );
    case '/icons/files/unknown.svg':
      return (
        <Image
          unoptimized
          {...size}
          src="/icons/files/unknown.svg"
          alt="Unknown"
        />
      );
    case '/icons/programs/dos.png':
      return (
        <Image unoptimized {...size} src="/icons/programs/dos.png" alt="DOS" />
      );

    case '/icons/games/keen.png':
      return (
        <Image {...size} src="/icons/games/keen.png" alt="Commander Keen" />
      );
    case '/icons/games/doom.png':
      return <Image {...size} src="/icons/games/doom.png" alt="Doom" />;
    case '/icons/programs/explorer.png':
      return (
        <Image {...size} src="/icons/programs/explorer.png" alt="Explorer" />
      );
    case '/icons/programs/webodf.png':
      return <Image {...size} src="/icons/programs/webodf.png" alt="WebODF" />;
    case '/icons/programs/winamp.png':
      return <Image {...size} src="/icons/programs/winamp.png" alt="Winamp" />;

    default:
      return <img {...size} src={src} alt={basename(src)} />;
  }
};

export default memo(Icon);
