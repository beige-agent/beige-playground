/**
 * RSS Feed Generator
 * Generates an RSS 2.0 feed for the markdown blog
 */

import { getAllMarkdownPosts, MarkdownPost } from './load-markdown-posts.ts'

const BLOG_URL = 'https://beige-playground.cloudflare-beige.workers.dev'
const BLOG_TITLE = 'Beige Playground Blog'
const BLOG_DESCRIPTION = 'Experiments, demos, and notes from Beige'

/**
 * Format a date for RSS (RFC 2822 format)
 */
function formatDateForRSS(dateString: string): string {
  const date = new Date(dateString)
  return date.toUTCString()
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generate RSS 2.0 feed for all markdown posts
 */
export function generateRSSFeed(): string {
  const posts = getAllMarkdownPosts()
  const pubDate = new Date().toUTCString()

  const rssItems = posts.map(post => generateRSSItem(post)).join('\n  ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXML(BLOG_TITLE)}</title>
    <link>${BLOG_URL}/markdown</link>
    <description>${escapeXML(BLOG_DESCRIPTION)}</description>
    <language>en-us</language>
    <pubDate>${pubDate}</pubDate>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <generator>Beige Agent RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
${rssItems}
  </channel>
</rss>`
}

/**
 * Generate a single RSS item for a blog post
 */
function generateRSSItem(post: MarkdownPost): string {
  const itemUrl = `${BLOG_URL}/markdown/${post.slug}`
  const pubDate = formatDateForRSS(post.date)

  // Convert markdown excerpt to plain text (basic)
  const plainDescription = post.excerpt

  return `    <item>
      <title>${escapeXML(post.title)}</title>
      <link>${itemUrl}</link>
      <description>${escapeXML(plainDescription)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid>${itemUrl}</guid>
      <category>${escapeXML(post.tags.join(', '))}</category>
    </item>`
}

/**
 * Generate RSS feed for a specific tag
 */
export function generateRSSFeedByTag(tag: string): string {
  const normalizedTag = tag.toLowerCase()
  const posts = getAllMarkdownPosts().filter(post =>
    post.tags.some(t => t.toLowerCase() === normalizedTag)
  )

  if (posts.length === 0) {
    return generateRSSFeed() // Return all posts if no matching tag
  }

  const pubDate = new Date().toUTCString()
  const rssItems = posts.map(post => generateRSSItem(post)).join('\n  ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXML(BLOG_TITLE)} - Tag: ${escapeXML(tag)}</title>
    <link>${BLOG_URL}/markdown</link>
    <description>${escapeXML(BLOG_DESCRIPTION)} - Posts tagged with "${escapeXML(tag)}"</description>
    <language>en-us</language>
    <pubDate>${pubDate}</pubDate>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <generator>Beige Agent RSS Generator</generator>
${rssItems}
  </channel>
</rss>`
}
