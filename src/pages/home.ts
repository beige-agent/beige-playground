import type { Post } from '../posts'
import { postCard } from './blog'

export function homePage(recentPosts: Post[]): string {
  return /* html */ `
  <div class="page">
    <!-- Hero -->
    <div style="margin-bottom:4rem">
      <p class="tag accent" style="margin-bottom:1rem">Live on Cloudflare Workers</p>
      <h1 style="font-size:clamp(2.2rem,5vw,3.5rem);font-weight:800;line-height:1.1;letter-spacing:-.03em">
        A playground for<br/>ideas that deserve<br/>
        <span style="color:var(--accent)">to be online.</span>
      </h1>
      <p style="margin-top:1.25rem;max-width:480px;color:var(--muted);font-size:1.05rem;line-height:1.6">
        Blog posts, 3D experiments, and small tools — deployed to the global edge
        in seconds. Built with Hono &amp; TypeScript.
      </p>
      <div style="margin-top:2rem;display:flex;gap:.75rem;flex-wrap:wrap">
        <a href="/blog" class="btn">Read the blog →</a>
        <a href="/3d"   class="btn ghost">3D demos</a>
        <a href="/shortener" class="btn ghost">URL shortener</a>
      </div>
    </div>

    <!-- Quick feature strip -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:4rem">
      ${featureTile('⚡', 'Edge-deployed', 'Served from Cloudflare\'s 300+ global PoPs. Sub-millisecond TTFB.')}
      ${featureTile('📝', 'Blog', 'Notes, tutorials, and experiments. Written in TypeScript, rendered at the edge.')}
      ${featureTile('🎮', '3D Demos', 'WebGL / Three.js experiments running entirely in your browser.')}
      ${featureTile('🔗', 'URL Shortener', 'Simple URL shortening demo using client-side storage.')}
    </div>

    <!-- Recent posts -->
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
        <h2 style="font-size:1.25rem;font-weight:700">Recent posts</h2>
        <a href="/blog" style="color:var(--muted);font-size:.9rem">All posts →</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem">
        ${recentPosts.map(postCard).join('')}
      </div>
    </div>
  </div>`
}

function featureTile(icon: string, title: string, desc: string): string {
  return /* html */ `
  <div class="card">
    <div style="font-size:1.5rem;margin-bottom:.75rem">${icon}</div>
    <div style="font-weight:700;margin-bottom:.4rem">${title}</div>
    <div style="color:var(--muted);font-size:.875rem">${desc}</div>
  </div>`
}
