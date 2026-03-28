# 🚀 beige-playground

The goto place to deploy experiments, blog posts, and interactive demos — live on Cloudflare Workers.

**Live site:** https://beige-playground.matthias-hausberger.workers.dev

## Stack

| Layer | Tech |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | [Hono](https://hono.dev) v4 |
| Language | TypeScript |
| 3D | Three.js (CDN, client-side) |

## Development

```bash
npm install
npm run dev       # http://localhost:8787
```

## Deploy

```bash
npm run deploy    # wrangler deploy
```

## Adding a blog post

Open `src/posts.ts` and add a new entry to the `POSTS` array:

```ts
{
  slug: 'my-post',
  title: 'My Post Title',
  date: '2026-04-01',
  tags: ['tag1', 'tag2'],
  excerpt: 'One-line summary.',
  body: /* html */ `<p>Content goes here…</p>`,
}
```

Then deploy. No CMS, no database — just TypeScript.

## Project structure

```
src/
  index.ts          ← Hono app + routing
  layout.ts         ← shared HTML shell + CSS
  posts.ts          ← blog post data
  pages/
    home.ts         ← homepage
    blog.ts         ← blog list + post pages
    3d.ts           ← Three.js demo page
```
