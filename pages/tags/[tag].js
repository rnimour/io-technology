import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import fs from 'fs'
import path from 'path'
import { useBrandingTheme } from '@/lib/hooks/useBrandingTheme'
import { getAuthors } from '@/lib/authors'

const root = process.cwd()

export async function getStaticPaths() {
  const tags = await getAllTags('blog')

  return {
    paths: Object.keys(tags).map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allPosts = await getAllFilesFrontMatter('blog')
  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((t) => kebabCase(t)).includes(params.tag)
  )

  // rss
  if (filteredPosts.length > 0) {
    const rss = await generateRss(filteredPosts, `tags/${params.tag}/feed.xml`)
    const rssPath = path.join(root, 'public', 'tags', params.tag)
    fs.mkdirSync(rssPath, { recursive: true })
    fs.writeFileSync(path.join(rssPath, 'feed.xml'), rss)
  }

  const authors = await getAuthors(allPosts)

  return { props: { posts: filteredPosts, tag: params.tag, authors, theme: 'green' } }
}

export default function Tag({ posts, tag, authors }) {
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const { theme } = useBrandingTheme()

  return (
    <>
      <TagSEO
        title={`#${title} - ${siteMetadata.author}`}
        description={`${title} tags - ${siteMetadata.author}`}
      />
      <ListLayout posts={posts} title={`All #${title} articles`} authors={authors} theme={theme} />
    </>
  )
}
