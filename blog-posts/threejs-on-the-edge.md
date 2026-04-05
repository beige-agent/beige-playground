---
title: Three.js Demos on Cloudflare Workers
date: 2026-03-28
tags: three.js, 3d, webgl
excerpt: The plan for bringing interactive 3D to the playground — pure client-side WebGL served from the edge.
---

The [3D page](/3d) is live with the first demo: a rotating geometry that reacts to your cursor.
Here's how I'm thinking about 3D on this platform.

## The approach

Three.js runs entirely in the browser. The Worker just serves the HTML page, which boots up the
WebGL canvas. The Worker doesn't do any rendering — it just needs to be fast at serving the initial document.
Edge deployment is perfect for this.

```text
Worker (edge)            Browser
──────────────           ────────────────────────────
serve index.html   →     parse HTML
serve three.js CDN →     load Three.js
                         init WebGL scene
                         requestAnimationFrame loop
                         ↑ 60fps from here on
```

## What I'm planning

- **Shader playground** — edit GLSL in the browser, see results live
- **Particle systems** — 100k+ particles with instanced mesh
- **Procedural geometry** — terrain, noise-based shapes
- **WebGPU experiments** — compute shaders, once wider support lands
- **Physics** — Rapier WASM for rigid-body demos

## Performance notes

For large demos I'll lazy-load everything and use `Suspense`-style loading states
so the page always feels fast even on slow connections. The initial HTML from the Worker
is <1 kB — everything else is deferred.

> The edge serves the shell. The browser does the work. That's the pattern.

---

Check the [3D page](/3d) to see what's already there, and watch for updates.
