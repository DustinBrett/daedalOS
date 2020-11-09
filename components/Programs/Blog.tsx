import styles from '@/styles/Programs/Blog.module.scss';

import type { AppComponent } from '@/types/utils/programs';

const BLOG_HOME_PAGE = 'https://www.dustinbrett.com/';

const Blog: React.FC<AppComponent> = () => (
  <iframe className={styles.blog} title="Blog" src={BLOG_HOME_PAGE} />
);

export default Blog;

export const loaderOptions = {
  width: 866,
  height: 725
};
