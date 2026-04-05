import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { layout } from './layout'
import { homePage } from './pages/home'
import { blogListPage, blogPostPage } from './pages/blog'
import { markdownBlogPage, markdownBlogPostPage } from './pages/markdown-blog'
import { threeDPage } from './pages/3d'
import { handsPage } from './pages/hands'
import { urlShortenerPage } from './pages/url-shortener'
import { shaderPlaygroundPage } from './pages/shader-playground'
import { particlesPage } from './pages/particles'
import { terrainPage } from './pages/terrain'
import { codeEditorPage } from './pages/code-editor'
import { POSTS } from './posts'
import { getAllMarkdownPosts, getMarkdownPostBySlug } from './load-markdown-posts'
import { generateRSSFeed, generateRSSFeedByTag } from './rss-feed'

const app = new Hono()

app.use('*', cors())

// ── Home ──────────────────────────────────────────────────────────────────────
app.get('/', (c) => c.html(layout('Beige Playground', homePage(POSTS.slice(0, 3)))))

// ── Blog ──────────────────────────────────────────────────────────────────────
app.get('/blog', (c) => c.html(layout('Blog · Beige Playground', blogListPage(POSTS))))

app.get('/blog/:slug', (c) => {
  const post = POSTS.find((p) => p.slug === c.req.param('slug'))
  if (!post) return c.html(layout('Not Found · Beige Playground', notFound()), 404)
  return c.html(layout(`${post.title} · Beige Playground`, blogPostPage(post)))
})

// ── Markdown Blog ─────────────────────────────────────────────────────────────
app.get('/markdown', (c) => {
  const posts = getAllMarkdownPosts()
  return c.html(layout('Markdown Blog · Beige Playground', markdownBlogPage(posts), '/rss'))
})

app.get('/markdown/:slug', (c) => {
  const post = getMarkdownPostBySlug(c.req.param('slug'))
  if (!post) return c.html(layout('Not Found · Beige Playground', notFound()), 404)
  return c.html(layout(`${post.title} · Beige Playground`, markdownBlogPostPage(post), '/rss'))
})

// ── RSS Feed ─────────────────────────────────────────────────────────────────
app.get('/rss', (c) => {
  const feed = generateRSSFeed()
  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=300'
    }
  })
})

app.get('/rss/:tag', (c) => {
  const tag = c.req.param('tag')
  const feed = generateRSSFeedByTag(tag)
  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=300'
    }
  })
})

// ── 3D ───────────────────────────────────────────────────────────────────────
app.get('/3d', (c) => c.html(layout('3D · Beige Playground', threeDPage())))

// ── URL Shortener ─────────────────────────────────────────────────────────────
app.get('/shortener', (c) => c.html(layout('URL Shortener · Beige Playground', urlShortenerPage())))

// ── Shader Playground ──────────────────────────────────────────────────────────
app.get('/shaders', (c) => c.html(layout('Shader Playground · Beige Playground', shaderPlaygroundPage())))

// ── Particles ────────────────────────────────────────────────────────────────────
app.get('/particles', (c) => c.html(particlesPage()))

// ── Terrain ─────────────────────────────────────────────────────────────────────
app.get('/terrain', (c) => c.html(terrainPage()))

// ── Code Editor ──────────────────────────────────────────────────────────────────
app.get('/editor', (c) => c.html(codeEditorPage()))

// ── Hand tracking ─────────────────────────────────────────────────────────────
app.get('/hands', (c) => c.html(handsPage()))

// ── 404 ──────────────────────────────────────────────────────────────────────
// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({
  status: 'healthy',
  service: 'beige-playground',
  version: '1.0.0',
  timestamp: Date.now(),
}))

app.notFound((c) => c.html(layout('Not Found · Beige Playground', notFound()), 404))

function notFound(): string {
  return `
  <div class="page">
    <h1 style="font-size:4rem">404</h1>
    <p style="color:var(--muted);margin-top:.5rem">Page not found.</p>
    <a href="/" class="btn" style="margin-top:2rem;display:inline-block">← Home</a>
  </div>`
}

export default app
