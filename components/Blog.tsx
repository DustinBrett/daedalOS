import BlogIcon from '@/assets/icons/Blog.png';

import type { FC } from 'react';
import App from '@/contexts/App';

type Post = {
  id: string;
  title: string;
  content: string;
};

const posts: Array<Post> = [];

const Post: FC<Post> = ({ content, title }) => (
  <article>
    <header>
      <h1>{title}</h1>
    </header>
    <p>{content}</p>
  </article>
);

const Blog: FC = () => (
  <article>
    {posts.map((post) => (
      <Post key={post.id} {...post} />
    ))}
  </article>
);

export default new App({
  component: Blog,
  icon: BlogIcon,
  name: 'Blog'
});
