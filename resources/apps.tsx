import Blog from '../components/Blog';

import BlogIcon from '../assets/svg/blog.svg';
import ContactIcon from '../assets/svg/contact.svg';

export type AppType = {
    component: React.ReactNode,
    icon: JSX.Element,
    id: number,
    name: string,
    title?: string,
    showIcon?: boolean,
    showWindow?: boolean
};

export const Apps: Array<AppType> = [
  {
    component: <Blog />,
    icon: <BlogIcon />,
    id: 0,
    name: 'Blog',
    showIcon: true,
    showWindow: true
  },
  {
    component: undefined,
    icon: <ContactIcon />,
    id: 1,
    name: 'Contact',
    showIcon: true,
    showWindow: false
  }
];
