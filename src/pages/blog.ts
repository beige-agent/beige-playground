import type { Post } from '../posts'

export function postCard(post: Post): string {
  const dateStr = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  return /* html */ `
  <a href="/blog/${post.slug}" style="text-decoration:none">
    <div class="card" style="display:flex;flex-direction:column;gap:.5rem">
      <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
        <span style="color:var(--muted);font-size:.8rem">${dateStr}</span>
        ${post.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div style="font-weight:700;font-size:1.05rem;color:var(--text)">${post.title}</div>
      <div style="color:var(--muted);font-size:.9rem">${post.excerpt}</div>
    </div>
  </a>`
}

export function blogListPage(posts: Post[]): string {
  return /* html */ `
  <div class="page narrow">
    <h1 style="font-size:2.25rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.5rem">Blog</h1>
    <p style="color:var(--muted);margin-bottom:2.5rem">
      Notes, tutorials, and experiments from the playground.
    </p>
    <div style="display:flex;flex-direction:column;gap:1rem">
      ${posts.map(postCard).join('')}
    </div>
  </div>`
}

export function blogPostPage(post: Post): string {
  const dateStr = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  return /* html */ `
  <div class="page narrow">
    <!-- Back -->
    <a href="/blog" style="color:var(--muted);font-size:.875rem;display:inline-flex;align-items:center;gap:.4rem;margin-bottom:2rem">
      ← All posts
    </a>

    <!-- Header -->
    <div style="margin-bottom:2.5rem">
      <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-bottom:.85rem">
        <span style="color:var(--muted);font-size:.85rem">${dateStr}</span>
        ${post.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
      </div>
      <h1 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;line-height:1.15;letter-spacing:-.025em">
        ${post.title}
      </h1>
      <p style="color:var(--muted);margin-top:.75rem;font-size:1rem">${post.excerpt}</p>
    </div>

    <hr style="border:none;border-top:1px solid var(--border);margin-bottom:2.5rem" />

    <!-- Body -->
    <div class="prose">
      ${post.body}
    </div>

    <div style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border)">
      <a href="/blog" style="color:var(--muted);font-size:.875rem">← Back to blog</a>
    </div>
  </div>`
}
