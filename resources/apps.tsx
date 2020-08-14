import Blog from '../components/Blog';

import BlogIcon from '../assets/svg/blog.svg';
import ChatIcon from '../assets/svg/chat.svg';

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
    icon: <ChatIcon />,
    id: 1,
    name: 'Chat',
    showIcon: true,
    showWindow: false
  }
];
