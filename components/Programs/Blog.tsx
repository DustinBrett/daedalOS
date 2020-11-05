import styles from '@/styles/Programs/Blog.module.scss';

import type { AppComponent } from '@/types/utils/programs';

const BLOG_HOME_PAGE = 'https://www.dustinbrett.com/';

// TODO
// - Emulate a browser that only works on my domain(s)
// - iframe.contentWindow.history.back();
// - iframe.contentWindow.history.forward();
// - Refresh button
// - Home button to go back to main page
// - Address bar that can't be edited
// - Search that works with Wordpress search

const Blog: React.FC<AppComponent> = () => (
  <iframe className={styles.blog} title="Blog" src={BLOG_HOME_PAGE} />
);

export default Blog;

export const loaderOptions = {
  width: 650,
  height: 700
};
