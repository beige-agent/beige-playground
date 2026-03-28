export function layout(title: string, body: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    /* ── Reset & tokens ─────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       #0d0d0f;
      --surface:  #141417;
      --border:   #1f1f24;
      --accent:   #d4b896;    /* warm beige */
      --accent2:  #7c6f5f;
      --text:     #e8e3dd;
      --muted:    #7a756e;
      --radius:   0.75rem;
      --font:     'Inter', system-ui, -apple-system, sans-serif;
      --mono:     'Fira Code', 'Cascadia Code', monospace;
    }

    /* ── Base ───────────────────────────────────────────────────────── */
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.65;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; display: block; }
    code, pre { font-family: var(--mono); }
    pre {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      overflow-x: auto;
      font-size: .88rem;
      line-height: 1.7;
    }
    code { background: var(--surface); padding: .15em .4em; border-radius: .3rem; font-size: .9em; }
    pre code { background: transparent; padding: 0; font-size: inherit; }

    /* ── Nav ────────────────────────────────────────────────────────── */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(13, 13, 15, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 2rem;
    }
    .nav-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      height: 56px;
    }
    .nav-brand {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text);
      margin-right: auto;
    }
    .nav-brand span { color: var(--accent); }
    .nav-link {
      color: var(--muted);
      font-size: .9rem;
      font-weight: 500;
      transition: color .15s;
    }
    .nav-link:hover, .nav-link.active { color: var(--text); text-decoration: none; }

    /* ── Layout ─────────────────────────────────────────────────────── */
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 4rem 2rem 6rem;
    }
    .narrow { max-width: 680px; }

    /* ── Typography helpers ─────────────────────────────────────────── */
    .tag {
      display: inline-block;
      padding: .2em .65em;
      border-radius: 9999px;
      background: var(--border);
      color: var(--muted);
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .tag.accent { background: rgba(212,184,150,.12); color: var(--accent); }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      padding: .55rem 1.2rem;
      border-radius: var(--radius);
      background: var(--accent);
      color: #111;
      font-weight: 600;
      font-size: .9rem;
      transition: opacity .15s;
      cursor: pointer;
      border: none;
    }
    .btn:hover { opacity: .85; text-decoration: none; }
    .btn.ghost {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
    }
    .btn.ghost:hover { border-color: var(--accent2); }

    /* ── Cards ──────────────────────────────────────────────────────── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.75rem;
      transition: border-color .2s, transform .2s;
    }
    .card:hover { border-color: var(--accent2); transform: translateY(-2px); }

    /* ── Footer ─────────────────────────────────────────────────────── */
    footer {
      border-top: 1px solid var(--border);
      padding: 2rem;
      text-align: center;
      color: var(--muted);
      font-size: .85rem;
    }

    /* ── Prose (blog posts) ─────────────────────────────────────────── */
    .prose h2 { font-size: 1.5rem; margin: 2.5rem 0 .75rem; color: var(--text); }
    .prose h3 { font-size: 1.15rem; margin: 2rem 0 .5rem; color: var(--text); }
    .prose p  { margin-bottom: 1.25rem; color: #c0bab4; }
    .prose ul, .prose ol { padding-left: 1.5rem; margin-bottom: 1.25rem; color: #c0bab4; }
    .prose li { margin-bottom: .4rem; }
    .prose strong { color: var(--text); }
    .prose blockquote {
      border-left: 3px solid var(--accent);
      margin: 1.5rem 0;
      padding: .75rem 1.25rem;
      color: var(--muted);
      font-style: italic;
    }
    .prose hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
    .prose a { color: var(--accent); }

    /* ── Responsive ─────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .page { padding: 2.5rem 1.25rem 4rem; }
      nav { padding: 0 1.25rem; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="/" class="nav-brand">beige<span>.</span>playground</a>
      <a href="/blog" class="nav-link">Blog</a>
      <a href="/3d" class="nav-link">3D</a>
      <a href="/hands" class="nav-link" style="color:var(--accent);font-weight:700">✋ Hands</a>
      <a href="/shaders" class="nav-link">Shaders</a>
      <a href="/particles" class="nav-link">Particles</a>
      <a href="/shortener" class="nav-link">URL Shortener</a>
    </div>
  </nav>

  ${body}

  <footer>
    <p>Built on Cloudflare Workers · Hono · TypeScript &nbsp;·&nbsp; Made by Beige 🤖</p>
  </footer>
</body>
</html>`
}
