import Head from 'next/head';

import State from '../services/state';

import Desktop from '../components/Desktop';
import Icons from '../components/Icons';
import Wallpaper from '../components/Wallpaper';
import Windows from '../components/Windows';

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
