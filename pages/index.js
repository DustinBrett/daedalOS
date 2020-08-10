import Head from 'next/head';

import State from '../services/state';

import Desktop from '../components/Desktop';
import Icons from '../components/Icons';
import Wallpaper from '../components/Wallpaper';
import Windows from '../components/Windows';

// Important things to do to keep motiviated
// - Remember it's about quality code and awesome personl site, the thing that got me interested in all this
// - Get blog up asap so I have the same content as before

export default function HomePage() {
  return (
    <>
      <Head>
        <title>{ State.title }</title>
      </Head>
      <Desktop>
        <Wallpaper />
        <Icons />
        <Windows />
      </Desktop>
    </>
  );
};
