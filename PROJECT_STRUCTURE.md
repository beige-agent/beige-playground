# Beige Playground - Project Structure

## File Overview

```
beige-playground/
│
├── src/
│   ├── index.ts                    # Main Hono application with routing
│   ├── layout.ts                   # HTML layout + comprehensive CSS design system
│   ├── posts.ts                    # Legacy blog posts data (3 posts)
│   ├── rss-feed.ts                 # RSS 2.0 feed generator
│   ├── load-markdown-posts.ts      # Markdown blog loader (9 posts)
│   └── pages/                      # Page components
│       ├── home.ts                 # Homepage component
│       ├── blog.ts                 # Legacy blog components (list + post)
│       ├── markdown-blog.ts        # Markdown blog (list + post)
│       ├── 3d.ts                   # Three.js interactive geometry
│       ├── shaders.ts              # GLSL shader playground
│       ├── particles.ts            # GPU-instanced particles (100k+)
│       ├── terrain.ts              # Procedural terrain (Perlin noise)
│       ├── editor.ts               # Live code editor (Monaco)
│       ├── hands.ts                 # Hand-tracking particles (MediaPipe)
│       └── shortener.ts            # URL shortener demo
│
├── blog-posts/                     # Markdown blog post files (for R2 migration)
│   ├── welcome-to-beige-playground.md
│   ├── building-with-hono.md
│   ├── threejs-on-the-edge.md
│   ├── hello-world.md
│   ├── hand-tracking-particles.md
│   ├── procedural-terrain-generation.md
│   ├── live-code-editor.md
│   ├── gpu-particle-system.md
│   └── glsl-shader-playground.md
│
├── node_modules/                   # Deno-installed npm packages
├── .wrangler/                      # Wrangler cache (world-writable)
│
├── deno.json                       # Deno configuration
├── deno.lock                       # Lockfile for dependencies
│
├── wrangler.toml                   # Cloudflare Workers config
├── package.json                    # Package metadata
├── tsconfig.json                   # TypeScript configuration
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Comprehensive documentation
├── STATUS.md                       # Current project status (this session)
└── PROJECT_STRUCTURE.md             # This file
```

## Route Structure

```
/                              → Homepage (hero, features, recent posts)
/blog                          → Legacy blog listing (3 posts)
/blog/:slug                    → Legacy individual blog posts
/markdown                      → Markdown blog listing (9 posts)
/markdown/:slug                → Markdown individual blog posts
/rss                           → RSS 2.0 feed (all posts)
/rss/:tag                      → RSS feed filtered by tag
/3d                            → Interactive Three.js geometry
/shaders                       → GLSL shader playground (live editor)
/particles                     → GPU-instanced particles (100k+ @ 60FPS)
/terrain                       → Procedural terrain (Perlin noise + biomes)
/editor                        → Live JS code editor (Monaco + console + DOM)
/hands                         → Hand-tracking particles (MediaPipe + gestures)
/shortener                     → URL shortener demo (localStorage)
*                              → 404 page
```

## Component Architecture

### Main Router (src/index.ts)
- **Imports**: All page components from `pages/` directory
- **Route definitions**: 10 functional routes + 404
- **Middleware**: None (all inline)
- **Type bindings**: KV namespace for future use

### Layout System (src/layout.ts)
- **HTML structure**: DOCTYPE, head, body, nav, footer
- **CSS design system**: Comprehensive styling with tokens
- **Color palette**: Dark theme (#0a0a0a background, #d4b896 accent)
- **Typography**: Inter for body, Fira Code for code
- **Components**: Nav, cards, buttons, tags, prose, grid
- **Responsive**: Mobile-first with breakpoints
- **Functions**:
  - `layout(title, content, options)` - Full page layout
  - `getNavigation()` - Navigation bar with links
  - `getFooter()` - Footer with copyright

### Page Components (src/pages/)

#### home.ts
- **Exports**: `homePage()`
- **Content**: Hero section, feature grid, recent posts
- **Features**: CTA buttons, descriptive feature cards

#### blog.ts
- **Exports**: `blogListPage()`, `blogPostPage()`
- **Content**: Legacy blog with 3 hardcoded posts
- **Features**: Post list, full post view, tags, dates

#### markdown-blog.ts
- **Exports**: `markdownListPage()`, `markdownPostPage(slug)`
- **Content**: Markdown blog with 9 posts
- **Features**: Client-side parsing with marked.js, styled rendering
- **Dependencies**: `load-markdown-posts.ts`

#### 3d.ts
- **Exports**: `threeDPage()`
- **Content**: Interactive Three.js geometry
- **Features**: Rotating cube, controls (rotate, zoom, wireframe)
- **Dependencies**: Three.js (CDN)

#### shaders.ts
- **Exports**: `shaderPage()`
- **Content**: Live GLSL shader editor
- **Features**: 5 example shaders, real-time compilation, error handling
- **Dependencies**: Three.js (CDN)

#### particles.ts
- **Exports**: `particlesPage()`
- **Content**: GPU-instanced particle system
- **Features**: 100k+ particles, 6 presets, performance metrics
- **Dependencies**: Three.js (CDN)

#### terrain.ts
- **Exports**: `terrainPage()`
- **Content**: Procedural terrain generation
- **Features**: Simplex noise, FBM, 6 biomes, interactive controls
- **Dependencies**: Three.js (CDN) + custom Simplex noise implementation

#### editor.ts
- **Exports**: `editorPage()`
- **Content**: Live JavaScript code editor
- **Features**: Monaco editor, console capture, DOM preview, safe execution
- **Dependencies**: Monaco Editor (CDN)

#### hands.ts
- **Exports**: `handsPage()`
- **Content**: Hand-tracking particle system
- **Features**: MediaPipe Hands, 8k particles, 5 gestures, custom physics
- **Dependencies**: MediaPipe Hands (CDN) + Three.js (CDN)

#### shortener.ts
- **Exports**: `shortenerPage()`
- **Content**: URL shortener demo
- **Features**: LocalStorage persistence, UI for creating/viewing shortcuts
- **Dependencies**: None (vanilla JS)

### Data Layer

#### posts.ts
- **Exports**: `POSTS` array (3 legacy posts)
- **Content**: Hardcoded HTML blog posts
- **Features**: Title, date, tags, excerpt, body, slug

#### load-markdown-posts.ts
- **Exports**: `MARKDOWN_POSTS` object (9 posts)
- **Functions**:
  - `getAllMarkdownPosts()` - All posts sorted by date
  - `getMarkdownPostBySlug(slug)` - Single post by slug
  - `getMarkdownPostSlugs()` - All post slugs
- **Content**: Markdown front-matter + raw markdown text

#### rss-feed.ts
- **Exports**: `generateRSSFeed()`, `generateRSSFeedByTag(tag)`
- **Features**: RSS 2.0 compliance, XML escaping, date formatting
- **Content-Type**: `application/rss+xml; charset=UTF-8`

## Configuration Files

### wrangler.toml
```toml
name = "beige-playground"
main = "src/index.ts"
compatibility_date = "2024-01-01"
# Future: KV, D1, R2 bindings go here
```

### deno.json
```json
{
  "imports": {
    "hono": "npm:hono@^4.0.0"
  },
  "compilerOptions": {
    "lib": ["deno.window"]
  }
}
```

### package.json
```json
{
  "name": "beige-playground",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

## Design System

### Color Palette
```css
--bg-primary: #0a0a0a
--bg-secondary: #1a1a1a
--bg-tertiary: #2a2a2a
--text-primary: #e0e0e0
--text-secondary: #a0a0a0
--accent: #d4b896
--accent-hover: #e8c9a8
--success: #4ade80
--warning: #facc15
--error: #f87171
```

### Typography
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif
--font-mono: 'Fira Code', 'Cascadia Code', monospace
--font-size-base: 16px
--line-height: 1.5
```

### Components
- **Cards**: `card` class with subtle borders and hover effects
- **Buttons**: `btn` (primary) and `btn.ghost` (outline)
- **Tags**: `tag` class for metadata badges
- **Prose**: `prose` class for blog content styling
- **Grid**: `grid` class with responsive columns
- **Nav**: Sticky header with responsive links

### Responsive Breakpoints
```css
@media (max-width: 768px) {
  /* Mobile styles */
}

@media (max-width: 480px) {
  /* Small mobile styles */
}
```

## Deployment Workflow

### Development
```bash
# From project directory
cd /workspace/projects/beige-playground

# Install dependencies (first time only)
deno install --allow-scripts

# Make wrangler cache writable
mkdir -p .wrangler/cache && chmod -R 777 .wrangler/

# Start dev server
wrangler dev
# Open http://localhost:8787
```

### Production (Critical Pattern)
```bash
# Deploy via wrangler tool (runs on gateway host)
wrangler deploy --cwd /home/matthias/.beige/agents/beige/workspace/projects/beige-playground
```

**Important**: The wrangler tool runs on the gateway host, not inside the container.
- `/workspace` in container = `/home/matthias/.beige/agents/beige/workspace/` on host
- Always use `--cwd` pointing to the host path

### Logs
```bash
wrangler tail
# View real-time logs
```

## Making Changes

### Adding a New Page
1. Create new page component in `src/pages/`
2. Import and add route in `src/index.ts`
3. Add link to navigation in `src/layout.ts`
4. Add feature tile to homepage if appropriate
5. Test with `wrangler dev`
6. Deploy with `wrangler deploy`
7. Verify route returns HTTP 200

### Adding a Blog Post
1. Add post data to `src/load-markdown-posts.ts`
2. Create markdown file in `blog-posts/` directory (optional, for R2 migration)
3. Test with `wrangler dev`
4. Deploy
5. Verify blog list and individual post page

### Styling Updates
- Edit CSS in `src/layout.ts` (shared styles)
- Add page-specific styles in page component if needed
- Keep consistent with design system tokens
- Test on mobile and desktop

## Performance Considerations

- **Bundle size**: ~235 KiB (gzipped: ~59 KiB)
- **Cold starts**: Sub-100ms with Workers
- **Edge caching**: Automatic with Cloudflare CDN
- **Inline CSS**: No external CSS requests
- **CDN libraries**: Three.js, Monaco, MediaPipe loaded from CDN
- **GPU acceleration**: Particle system uses instanced rendering

## External Dependencies (CDN)

### Three.js
- `https://unpkg.com/three@0.160.0/build/three.module.js`
- Used for: 3D demos, particles, terrain, hands

### MediaPipe Hands
- `https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js`
- `https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js`
- `https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js`
- Used for: Hand tracking

### Monaco Editor
- `https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js`
- Used for: Live code editor

### marked.js
- `https://cdn.jsdelivr.net/npm/marked/marked.min.js`
- Used for: Markdown parsing

## Security Notes

- **CORS**: Not enabled (Worker returns HTML directly)
- **Input validation**: Minimal (no user input handling)
- **XSS prevention**: Use `textContent` instead of `innerHTML` where possible
- **Rate limiting**: Not implemented (add via Cloudflare Workers if needed)
- **Authentication**: Not implemented

## Future Enhancements

### Short-Term
- [ ] Add search functionality to markdown blog
- [ ] Add related posts section
- [ ] Improve mobile optimization

### Medium-Term
- [ ] Migrate markdown posts to R2 bucket
- [ ] Implement physics sandbox (Rapier WASM)
- [ ] Add image transform API

### Long-Term
- [ ] Add WebGPU compute shader experiments
- [ ] Add comments system to blog
- [ ] Implement user authentication
- [ ] Add analytics integration

## Git Workflow

**Repository**: https://github.com/beige-agent/beige-playground

**Best Practices** (from AGENTS.md):
```bash
# Clone with SSH
git clone git@github.com:beige-agent/beige-playground.git

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push -u origin feature/new-feature

# Create PR with GitHub CLI
gh pr create --title "Add new feature" --body "Description"
```

## Support & Maintenance

- **Updating dependencies**: Update versions in package.json, run `deno install --allow-scripts`
- **Checking logs**: `wrangler tail` for production logs
- **Monitoring**: All routes return HTTP 200, check via curl
- **Rollbacks**: `wrangler rollback <version-id>`
- **Type checking**: Run `deno check` before deploying

---

**Last Updated**: 2026-03-28
**Version**: 1.0.0
**Status**: ✅ LIVE AND FULLY OPERATIONAL
**Live URL**: https://beige-playground.cloudflare-beige.workers.dev
**GitHub**: https://github.com/beige-agent/beige-playground
