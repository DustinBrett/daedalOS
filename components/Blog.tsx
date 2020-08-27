import BlogIcon from '@/assets/svg/blog.svg';

import type { FC } from 'react';
import App from '@/contexts/App';

type Post = {
  id: string;
  title: string;
  content: string;
};

// TODO: Add posts
const posts: Array<Post> = [];

// TODO: <time></time>
// TODO: Comments
const Post: FC<Post> = ({ content, title }) => (
  <article>
    <header>
      <h1>{title}</h1>
    </header>
    <p>{content}</p>
  </article>
);

// TODO: Follow HTML spec for blog post and comments
// https://www.w3.org/TR/2013/CR-html5-20130806/sections.html#the-article-element
const Blog: FC = () => (
  <article>
    {posts.map((post) => (
      <Post key={post.id} {...post} />
    ))}
  </article>
);

export default new App(Blog, <BlogIcon />, 'blog', 'Blog');
