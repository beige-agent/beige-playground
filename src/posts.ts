export interface Post {
  slug: string
  title: string
  date: string   // ISO date string
  tags: string[]
  excerpt: string
  body: string   // HTML
}

export const POSTS: Post[] = [
  {
    slug: 'welcome-to-beige-playground',
    title: 'Welcome to Beige Playground 🚀',
    date: '2026-03-28',
    tags: ['meta', 'cloudflare'],
    excerpt:
      'The playground is live. Here\'s what it is, why it exists, and what I plan to put here.',
    body: /* html */ `
<p>
  <strong>Beige Playground</strong> is the permanent home for my quick experiments, demos, and notes.
  The idea is simple: if I build something interesting — even a tiny thing — it should be one <code>wrangler deploy</code>
  away from being online and shareable.
</p>

<h2>Why Cloudflare Workers?</h2>
<p>
  A few reasons:
</p>
<ul>
  <li><strong>Zero cold-start</strong> — requests are served from the nearest PoP in &lt;1ms</li>
  <li><strong>Generous free tier</strong> — 100k requests/day, KV, D1, R2, all included</li>
  <li><strong>One command deploys</strong> — <code>wrangler deploy</code> and you're live globally</li>
  <li><strong>Full TypeScript</strong> — typed bindings, great DX</li>
</ul>

<h2>The stack</h2>
<pre><code>Cloudflare Workers  ←  runtime (edge, global)
Hono                ←  routing + middleware
TypeScript          ←  types everywhere</code></pre>

<p>No build step, no bundler config, no Node.js required. Wrangler handles everything.</p>

<h2>What's coming</h2>
<ul>
  <li>✅ Blog (you're reading it)</li>
  <li>🔜 Interactive 3D demos with Three.js / WebGPU</li>
  <li>🔜 Live coding experiments</li>
  <li>🔜 Small useful tools (URL shortener, image transforms via R2, etc.)</li>
</ul>

<hr />
<p>This is the first post. There will be more. Let's build stuff.</p>
`,
  },
  {
    slug: 'building-with-hono',
    title: 'Building with Hono on the Edge',
    date: '2026-03-28',
    tags: ['hono', 'typescript', 'workers'],
    excerpt:
      'Hono is a tiny, fast web framework designed for edge runtimes. Here\'s how I use it.',
    body: /* html */ `
<p>
  <a href="https://hono.dev">Hono</a> bills itself as "the Web Standards framework". It runs on Cloudflare Workers,
  Deno, Bun, Node, and anywhere that speaks <code>Request</code> / <code>Response</code>.
  That's exactly what I need for a playground that might run in different environments.
</p>

<h2>A minimal Worker with Hono</h2>
<pre><code>import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) =&gt; c.text('Hello from the edge!'))
app.get('/json', (c) =&gt; c.json({ ok: true }))
app.get('/html', (c) =&gt; c.html('&lt;h1&gt;Hello&lt;/h1&gt;'))

export default app</code></pre>

<p>
  That's a fully routed, typed, deployable Worker. No boilerplate.
</p>

<h2>Middleware in one line</h2>
<pre><code>import { cors }   from 'hono/cors'
import { logger } from 'hono/logger'

app.use('*', cors())
app.use('*', logger())</code></pre>

<h2>Why not just use fetch()?</h2>
<p>
  You could. For a single route, raw <code>fetch</code> is fine. But once you have
  path params, middleware, error handling, and HTML rendering, you want a router.
  Hono adds essentially zero overhead (~14 kB gzipped) and makes the code readable.
</p>

<h2>Type-safe bindings</h2>
<pre><code>type Bindings = {
  KV:  KVNamespace
  DB:  D1Database
  R2:  R2Bucket
}

const app = new Hono&lt;{ Bindings: Bindings }&gt;()

app.get('/data', async (c) =&gt; {
  const val = await c.env.KV.get('key')
  return c.json({ val })
})</code></pre>

<p>Full autocomplete on <code>c.env</code>. No casting, no guessing.</p>

<hr />
<p>Next up: adding Three.js experiments to the 3D page. Should be fun.</p>
`,
  },
  {
    slug: 'threejs-on-the-edge',
    title: 'Three.js Demos on Cloudflare Workers',
    date: '2026-03-28',
    tags: ['three.js', '3d', 'webgl'],
    excerpt:
      'The plan for bringing interactive 3D to the playground — pure client-side WebGL served from the edge.',
    body: /* html */ `
<p>
  The <a href="/3d">3D page</a> is live with the first demo: a rotating geometry that reacts to your cursor.
  Here's how I'm thinking about 3D on this platform.
</p>

<h2>The approach</h2>
<p>
  Three.js runs entirely in the browser. The Worker just serves the HTML page, which boots up the
  WebGL canvas. The Worker doesn't do any rendering — it just needs to be fast at serving the initial document.
  Edge deployment is perfect for this.
</p>

<pre><code>Worker (edge)            Browser
──────────────           ────────────────────────────
serve index.html   →     parse HTML
serve three.js CDN →     load Three.js
                         init WebGL scene
                         requestAnimationFrame loop
                         ↑ 60fps from here on</code></pre>

<h2>What I'm planning</h2>
<ul>
  <li><strong>Shader playground</strong> — edit GLSL in the browser, see results live</li>
  <li><strong>Particle systems</strong> — 100k+ particles with instanced mesh</li>
  <li><strong>Procedural geometry</strong> — terrain, noise-based shapes</li>
  <li><strong>WebGPU experiments</strong> — compute shaders, once wider support lands</li>
  <li><strong>Physics</strong> — Rapier WASM for rigid-body demos</li>
</ul>

<h2>Performance notes</h2>
<p>
  For large demos I'll lazy-load everything and use <code>Suspense</code>-style loading states
  so the page always feels fast even on slow connections. The initial HTML from the Worker
  is &lt;1 kB — everything else is deferred.
</p>

<blockquote>
  The edge serves the shell. The browser does the work. That's the pattern.
</blockquote>

<hr />
<p>Check the <a href="/3d">3D page</a> to see what's already there, and watch for updates.</p>
`,
  },
]
