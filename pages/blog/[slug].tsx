import React, { FC } from 'react';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Post } from '../../types';
import Container from '../../components/container';
import HomeNav from '../../components/homeNav';
import { posts as postsFromCMS } from '../../content';

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
  const content = hydrate(source);
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Pane width="100%" height="100%">
        <Spinner size={48} />
      </Pane>
    );
  }

  return (
    <Pane>
      <Head>
        <title>{`Known Blog | ${frontMatter.title}`}</title>
        <meta name="description" content={frontMatter.summary} />
      </Head>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          <Heading fontSize="clamp(2rem, 8vw, 6rem)" lineHeight="clamp(2rem, 8vw, 6rem)" marginY={majorScale(3)}>
            {frontMatter.title}
          </Heading>
          <Pane>{content}</Pane>
        </Container>
      </main>
    </Pane>
  );
}

BlogPost.defaultProps = {
  source: '',
  frontMatter: { title: 'default title', summary: 'summary', publishedOn: '' },
};

export async function getStaticPaths() {
  const postsPath = path.join(process.cwd(), 'posts');
  const postFileNames = await fs.readdir(postsPath);
  const slugs = await Promise.all(postFileNames.map(async (name) => {
    const fullPath = path.join(process.cwd(), 'posts', name);
    const file = await fs.readFile(fullPath, 'utf-8');
    const { data } = matter(file);
    return data;
  }));

  return {
    paths: slugs.map(s => ({
      params: {
        slug: s.slug
      }
    })),
    fallback: true
  };
}

export async function getStaticProps({ params, preview }) {
  let post;

  try {
    const filePath = path.join(process.cwd(), 'posts', params.slug + '.mdx');
    post = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    const postsToShow = preview ? postsFromCMS.draft : postsFromCMS.published;
    const cmsPosts = postsToShow.map(post => {
      return matter(post);
    });

    post = cmsPosts.find(p => p.data.slug === params.slug).content;
  }

  const { data } = matter(post);
  const mdxSource = await renderToString(post, { scope: data });

  return {
    props: {
      source: mdxSource,
      frontMatter: data
    }
  }
}

export default BlogPost;
