import Head from 'next/head';

import State from '../services/state';

import Desktop from '../components/Desktop';
import Icon from '../components/Icon';
import Wallpaper from '../components/Wallpaper';
import Window from '../components/Window';

const

  Icons = () => State.desktop.icons.map(icon =>
    <Icon key={ icon.id } { ...icon } />),

  Windows = () => State.desktop.windows.map(window =>
    <Window key={ window.id } { ...window } />);

export default function HomePage() {
  return (
    <>
      <Head>
        <title>{ State.title }</title>
      </Head>
      <Wallpaper />
      <Desktop>
        <Icons />
        <Windows />
      </Desktop>
    </>
  )
};
