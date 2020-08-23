import type { ReactElement } from 'react';
import { useState } from 'react';
import { Desktop } from '../components/Desktop';
import { Icons } from '../components/Icons';
import { MetaData } from '../components/MetaData';
import { Taskbar } from '../components/Taskbar';
import App from '../contexts/App';
import Blog from '../components/Blog';

const initialApps: Array<App> = [Blog];

export default function HomePage(): ReactElement {
  const [apps, updateApps] = useState(initialApps);

  return (
    <>
      <MetaData />
      <Desktop>
        <Icons apps={ apps } />
        <Taskbar apps={ apps } />
      </Desktop>
    </>
  );
}
