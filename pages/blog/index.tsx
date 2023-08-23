import React from 'react';
import { Pane, majorScale } from 'evergreen-ui';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs/promises';
import orderby from 'lodash.orderby';
import Container from '../../components/container';
import HomeNav from '../../components/homeNav';
import PostPreview from '../../components/postPreview';
import { posts as postsFromCMS } from '../../content';

const Blog = ({ posts }) => {
  return (
    <Pane>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          {posts.map((post) => (
            <Pane key={post.title} marginY={majorScale(5)}>
              <PostPreview post={post} />
            </Pane>
          ))}
        </Container>
      </main>
    </Pane>
  );
}

Blog.defaultProps = {
  posts: [],
};

export async function getStaticProps(ctx) {
  const postsToShow = ctx.preview ? postsFromCMS.draft : postsFromCMS.published;
  const cmsPosts = postsToShow.map(post => {
    const { data } = matter(post);
    return data;
  });

  const postsPath = path.join(process.cwd(), 'posts');
  const postFileNames = await fs.readdir(postsPath);
  const filePosts = await Promise.all(postFileNames.map(async (name) => {
    const fullPath = path.join(process.cwd(), 'posts', name);
    const file = await fs.readFile(fullPath, 'utf-8');
    const { data } = matter(file);
    return data;
  }));

  const posts = orderby(
    [...cmsPosts, ...filePosts],
    ['publishedOn'],
    ['desc'],
  );
  // const posts = [...cmsPosts, ...filePosts];

  return {
    props: {
      posts
    }
  };
}

export default Blog;