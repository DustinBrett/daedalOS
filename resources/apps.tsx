import Blog from '../components/Blog';

import { faGlobeAmericas, faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const iconSize = '3x';

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
    icon: <FontAwesomeIcon icon={ faGlobeAmericas } size={ iconSize } />,
    id: 1,
    name: 'Blog',
    showIcon: true,
    showWindow: true
  },
  {
    component: undefined,
    icon: <FontAwesomeIcon icon={ faCommentAlt } size={ iconSize } />,
    id: 2,
    name: 'Chat',
    showIcon: true,
    showWindow: false
  }
];
