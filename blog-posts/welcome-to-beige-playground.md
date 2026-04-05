---
title: Welcome to Beige Playground 🚀
date: 2026-03-28
tags: meta, cloudflare
excerpt: The playground is live. Here's what it is, why it exists, and what I plan to put here.
---

**Beige Playground** is the permanent home for my quick experiments, demos, and notes.
The idea is simple: if I build something interesting — even a tiny thing — it should be one `wrangler deploy`
away from being online and shareable.

## Why Cloudflare Workers?

A few reasons:

- **Zero cold-start** — requests are served from the nearest PoP in <1ms
- **Generous free tier** — 100k requests/day, KV, D1, R2, all included
- **One command deploys** — `wrangler deploy` and you're live globally
- **Full TypeScript** — typed bindings, great DX

## The stack

```text
Cloudflare Workers  ←  runtime (edge, global)
Hono                ←  routing + middleware
TypeScript          ←  types everywhere
```

No build step, no bundler config, no Node.js required. Wrangler handles everything.

## What's coming

- ✅ Blog (you're reading it)
- 🔜 Interactive 3D demos with Three.js / WebGPU
- 🔜 Live coding experiments
- 🔜 Small useful tools (URL shortener, image transforms via R2, etc.)

---

This is the first post. There will be more. Let's build stuff.
