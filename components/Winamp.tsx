import WinampIcon from '@/assets/icons/Winamp.png';

import type { FC } from 'react';
import type Webamp from 'webamp';
import type { Options } from 'webamp';
import { useEffect, useRef } from 'react';
import App from '@/contexts/App';

const options: Options = {
  initialTracks: [
    {
      metaData: {
        artist: 'DJ Mike Llama',
        title: "Llama Whippin' Intro"
      },
      url: '/mp3/llama-2.91.mp3'
    }
  ],
  initialSkin: {
    url: '/skins/SpyAMP_Professional_Edition_v5.wsz'
  },
  zIndex: 1750
};

// TODO: Closing it just makes it unreachable. Need to do destroy perhaps?
// TODO: Pass desktopRef in so it loads in desktop

const Winamp: FC = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let webamp: Webamp;

    import('webamp').then((Webamp) => {
      webamp = new Webamp.default(options);
      webamp.renderWhenReady(elementRef?.current as HTMLDivElement);
    });

    return () => {
      webamp.dispose();
    };
  }, [elementRef]);

  return <div ref={elementRef} />;
};

export default new App(Winamp, WinampIcon, 'winamp', 'Winamp');
