import Blog from '../components/Blog';

import BlogIcon from '../assets/svg/blog.svg';
import ContactIcon from '../assets/svg/contact.svg';

export type Apps = {
  [key: string]: AppType;
};

export type AppType = {
    component: React.ReactNode,
    icon: JSX.Element,
    id: number,
    minimized?: boolean,
    maximized?: boolean,
    name: string,
    opened: boolean
};

export const apps: Apps = {
  'blog': {
    component: <Blog />,
    icon: <BlogIcon />,
    id: 0,
    name: 'Blog',
    opened: true
  },
  'contact': {
    component: undefined,
    icon: <ContactIcon />,
    id: 1,
    name: 'Contact',
    opened: false
  }
};
