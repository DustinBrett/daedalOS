import type { FC } from 'react';
import BlogIcon from '../assets/svg/blog.svg';

type PostType = {
  id: string;
  title: string;
  content: string;
};

const posts: Array<PostType> = [];

const Post = ({ title, content }: PostType) => (
  <article>
    <header>
      <h1>{title}</h1>
      {/* <p><time datetime="2009-10-09">3 days ago</time></p> */}
    </header>
    {/* Possibly loop through sections array within each post
    <section>
      <h1>Red Delicious</h1>
      <p>These bright red apples are the most common found in many
      supermarkets.</p>
    </section>
    <section>
      <h1>Granny Smith</h1>
      <p>These juicy, green apples make a great filling for
      apple pies.</p>
    </section> */}
    <p>{content}</p>
    {/* Add comments section
    <section>
      <h1>Comments</h1>
      <article id="c1">
      <p>Yeah! Especially when talking about your lobbyist friends!</p>
      <footer>
        <p>Posted by: <span>
        <span>George Washington</span>
        </span></p>
        <p><time datetime="2009-10-10">15 minutes ago</time></p>
      </footer>
      </article>
    </section> */}
  </article>
);

const Blog: FC = () => (
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
