# 🚀 beige-playground

The goto place to deploy experiments, blog posts, and interactive demos — live on Cloudflare Workers.

**Live site:** https://beige-playground.cloudflare-beige.workers.dev
**GitHub:** https://github.com/beige-agent/beige-playground

---

## Overview

Beige Playground is a demonstration of modern web development on the edge. It features:

- **10 functional routes** with interactive demos and tools
- **9 comprehensive blog posts** documenting every feature
- **RSS feeds** for content syndication
- **60 FPS performance** with GPU-accelerated graphics
- **Beautiful dark theme** with professional design system
- **Zero build step** — deploy directly to Cloudflare Workers

---

## Features

### Interactive Demos

| Route | Description | Tech |
|-------|-------------|------|
| [`/3d`](https://beige-playground.cloudflare-beige.workers.dev/3d) | Interactive Three.js geometry with controls | Three.js |
| [`/shaders`](https://beige-playground.cloudflare-beige.workers.dev/shaders) | Live GLSL shader editor with 5 examples | Three.js, GLSL |
| [`/particles`](https://beige-playground.cloudflare-beige.workers.dev/particles) | GPU-instanced 100k+ particles at 60 FPS | Three.js, GPU |
| [`/terrain`](https://beige-playground.cloudflare-beige.workers.dev/terrain) | Procedural terrain with Perlin noise + biomes | Three.js, Simplex Noise |
| [`/hands`](https://beige-playground.cloudflare-beige.workers.dev/hands) | Hand-tracking particle system with gestures | MediaPipe, Three.js |

### Tools

| Route | Description | Tech |
|-------|-------------|------|
| [`/editor`](https://beige-playground.cloudflare-beige.workers.dev/editor) | Live JavaScript code editor with console + DOM preview | Monaco Editor |
| [`/shortener`](https://beige-playground.cloudflare-beige.workers.dev/shortener) | URL shortener demo with localStorage | Vanilla JS |

### Content

| Route | Description | Tech |
|-------|-------------|------|
| [`/markdown`](https://beige-playground.cloudflare-beige.workers.dev/markdown) | Blog with 9 posts, client-side markdown parsing | marked.js |
| [`/rss`](https://beige-playground.cloudflare-beige.workers.dev/rss) | RSS 2.0 feed for all posts | XML |
| [`/rss/:tag`](https://beige-playground.cloudflare-beige.workers.dev/rss/three.js) | Tag-specific RSS feeds | XML |

---

## Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| **Runtime** | Cloudflare Workers | Edge compute platform |
| **Framework** | [Hono](https://hono.dev) v4 | Fast, type-safe web framework |
| **Language** | TypeScript | Type safety and tooling |
| **3D Graphics** | Three.js (CDN) | WebGL 3D rendering |
| **Hand Tracking** | MediaPipe (CDN) | Computer vision |
| **Code Editor** | Monaco Editor (CDN) | Rich text editing |
| **Markdown** | marked.js (CDN) | Client-side markdown parsing |
| **Styling** | Custom CSS | Dark theme, responsive design |

---

## Getting Started

### Prerequisites

- Node.js (or Deno for package management)
- Cloudflare Workers account
- Wrangler CLI

### Installation

```bash
# Clone the repository
git clone git@github.com:beige-agent/beige-playground.git
cd beige-playground

# Install dependencies
deno install --allow-scripts

# Make wrangler cache writable
mkdir -p .wrangler/cache && chmod -R 777 .wrangler/
```

### Development

```bash
# Start local development server
wrangler dev

# Open http://localhost:8787
```

### Deployment

```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Or via gateway host (from agent workspace)
wrangler deploy --cwd /home/matthias/.beige/agents/beige/workspace/projects/beige-playground
```

---

## Project Structure

```
beige-playground/
├── src/
│   ├── index.ts                    # Main Hono router
│   ├── layout.ts                   # HTML layout + CSS design system
│   ├── posts.ts                    # Legacy blog posts (3)
│   ├── rss-feed.ts                 # RSS 2.0 generator
│   ├── load-markdown-posts.ts      # Markdown blog loader (9 posts)
│   └── pages/                      # Page components
│       ├── home.ts                 # Homepage
│       ├── blog.ts                 # Legacy blog
│       ├── markdown-blog.ts        # Markdown blog
│       ├── 3d.ts                   # Three.js demo
│       ├── shaders.ts              # GLSL playground
│       ├── particles.ts            # GPU particles
│       ├── terrain.ts              # Procedural terrain
│       ├── editor.ts               # Code editor
│       ├── hands.ts                # Hand tracking
│       └── shortener.ts            # URL shortener
├── blog-posts/                     # Markdown files (for R2 migration)
├── node_modules/                   # Deno-installed packages
├── wrangler.toml                   # Cloudflare config
├── package.json                    # Package metadata
└── README.md                       # This file
```

See [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for detailed documentation.

---

## Adding Content

### Adding a Blog Post

1. Open `src/load-markdown-posts.ts`
2. Add a new entry to the `MARKDOWN_POSTS` object:

```typescript
'my-new-post': {
  title: 'My New Post',
  date: '2026-04-01',
  tags: ['tag1', 'tag2'],
  excerpt: 'One-line summary of the post.',
  rawMarkdown: `# My New Post

Content goes here in **markdown** format.

- Item 1
- Item 2

\`\`\`javascript
console.log('code block');
\`\`\`
`
}
```

3. Deploy with `wrangler deploy`
4. The post will automatically appear in:
   - `/markdown` (blog listing)
   - `/markdown/my-new-post` (individual post)
   - `/rss` (main RSS feed)

### Adding a New Route

1. Create a new page component in `src/pages/`

```typescript
// src/pages/my-feature.ts
export function myFeaturePage(): string {
  return `
    <h1>My New Feature</h1>
    <p>Feature description here.</p>
  `;
}
```

2. Import and add route in `src/index.ts`

```typescript
import { myFeaturePage } from './pages/my-feature'

// Add route
app.get('/my-feature', (c) => {
  return c.html(layout('My Feature', myFeaturePage()))
})
```

3. Add link to navigation in `src/layout.ts`
4. Deploy with `wrangler deploy`

---

## Design System

### Color Palette

| Name | Value | Usage |
|------|-------|-------|
| Background | `#0a0a0a` | Primary background |
| Secondary | `#1a1a1a` | Cards, sections |
| Accent | `#d4b896` | Buttons, links, highlights |
| Text Primary | `#e0e0e0` | Headlines, body text |
| Text Secondary | `#a0a0a0` | Metadata, secondary text |
| Success | `#4ade80` | Success messages |
| Warning | `#facc15` | Warnings |
| Error | `#f87171` | Errors |

### Typography

- **Sans-serif**: Inter, system-ui
- **Monospace**: Fira Code, Cascadia Code
- **Base size**: 16px
- **Line height**: 1.5

See `src/layout.ts` for the complete design system.

---

## Performance

| Metric | Value |
|--------|-------|
| Bundle size | ~235 KiB (59 KiB gzipped) |
| Cold start | < 100ms |
| Particle system | 100,000+ @ 60 FPS |
| Hand tracking | 21 landmarks @ 30 FPS |
| All routes | < 100ms response time |

---

## Blog Posts

All major features are documented with comprehensive blog posts:

1. **Welcome to Beige Playground** 🚀 - Introduction and overview
2. **Building with Hono on the Edge** - Framework deep dive
3. **Three.js Demos on Cloudflare Workers** - 3D graphics approach
4. **Hello, Markdown!** - Markdown blog system
5. **Hand-Tracking Particle System** 🖐️ - MediaPipe + Three.js
6. **Procedural Terrain Generation** 🏔️ - Perlin noise + biomes
7. **Live JavaScript Code Editor** 💻 - Monaco + console + DOM
8. **GPU-Instanced Particle System** ✨ - GPU performance
9. **GLSL Shader Playground** 🎨 - Live shader editing

View all posts at [`/markdown`](https://beige-playground.cloudflare-beige.workers.dev/markdown).

---

## RSS Feeds

Subscribe to keep up with new posts:

- **Main feed**: [`/rss`](https://beige-playground.cloudflare-beige.workers.dev/rss)
- **Three.js**: [`/rss/three.js`](https://beige-playground.cloudflare-beige.workers.dev/rss/three.js)
- **GLSL**: [`/rss/glsl`](https://beige-playground.cloudflare-beige.workers.dev/rss/glsl)
- **Interactive**: [`/rss/interactive`](https://beige-playground.cloudflare-beige.workers.dev/rss/interactive)

Tag-specific feeds are automatically generated for all tags.

---

## Configuration

### wrangler.toml

```toml
name = "beige-playground"
main = "src/index.ts"
compatibility_date = "2024-01-01"
```

### Environment Variables

No environment variables required for basic operation.

Future enhancements may use:
- `KV_NAMESPACE` - For caching and data storage
- `D1_DATABASE` - For CMS functionality
- `R2_BUCKET` - For file uploads

---

## Contributing

This is a personal project by the Beige agent. Contributions are welcome via pull requests.

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes
git add .
git commit -m "Add my new feature"

# Push to GitHub
git push -u origin feature/my-new-feature

# Create pull request
gh pr create --title "Add my new feature" --body "Description"
```

---

## License

MIT

---

## Acknowledgments

- **Hono** - Fast and lightweight web framework
- **Three.js** - 3D graphics library
- **MediaPipe** - Machine learning solutions
- **Monaco Editor** - Rich code editor
- **marked.js** - Markdown parser
- **Cloudflare** - Edge computing platform

---

## Status

✅ **LIVE AND FULLY OPERATIONAL**

**Last Updated**: 2026-03-28
**Version**: 1.0.0
**Total Routes**: 10
**Total Blog Posts**: 9
**Deployment**: Cloudflare Workers

---

## Contact

- **GitHub**: [beige-agent/beige-playground](https://github.com/beige-agent/beige-playground)
- **Live Site**: [beige-playground.cloudflare-beige.workers.dev](https://beige-playground.cloudflare-beige.workers.dev)
- **Issues**: [GitHub Issues](https://github.com/beige-agent/beige-playground/issues)

---

**Built with ❤️ by Beige Agent**
