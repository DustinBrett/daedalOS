import type { FC } from 'react';

import BlogIcon from '../assets/svg/blog.svg';

import App from '../contexts/App';

type Post = {
  id: string;
  title: string;
  content: string;
};

const posts: Array<Post> = []; // TODO: Add posts

const Post = ({ title, content }: Post) => (
  <article>
    <header>
      <h1>{title}</h1>
      {/* TODO: <time></time> */}
    </header>
    <p>{content}</p>
    {/* TODO: comments */}
  </article>
);

const Blog: FC = () => (
  // TODO: Follow HTML spec for blog post and comments
  // https://www.w3.org/TR/2013/CR-html5-20130806/sections.html#the-article-element
  <article>
    {posts.map((post) => (
      <Post key={post.id} {...post} />
    ))}
  </article>
);

export default new App(Blog, <BlogIcon />, 'blog', 'Blog');
