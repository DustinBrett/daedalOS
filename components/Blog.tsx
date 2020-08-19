import type { FC } from 'react';
import BlogIcon from '../assets/svg/blog.svg';

type Post = {
  id: string;
  title: string;
  content: string;
};

const posts: Array<Post> = [];

const Post = ({ title, content }: Post) => (
  <article>
    <header>
      <h1>{title}</h1>
    </header>
    <p>{content}</p>
  </article>
);

const Blog: FC = () => (
  // https://www.w3.org/TR/2013/CR-html5-20130806/sections.html#the-article-element
  <article>
    {posts.map((post) => (
      <Post key={post.id} {...post} />
    ))}
  </article>
);

export default {
  component: Blog,
  icon: <BlogIcon />,
  id: 'blog',
  name: 'Blog'
};
