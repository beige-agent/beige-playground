---
title: Building with Hono on the Edge
date: 2026-03-28
tags: hono, typescript, workers
excerpt: Hono is a tiny, fast web framework designed for edge runtimes. Here's how I use it.
---

[Hono](https://hono.dev) bills itself as "the Web Standards framework". It runs on Cloudflare Workers,
Deno, Bun, Node, and anywhere that speaks `Request` / `Response`.
That's exactly what I need for a playground that might run in different environments.

## A minimal Worker with Hono

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello from the edge!'))
app.get('/json', (c) => c.json({ ok: true }))
app.get('/html', (c) => c.html('<h1>Hello</h1>'))

export default app
```

That's a fully routed, typed, deployable Worker. No boilerplate.

## Middleware in one line

```typescript
import { cors }   from 'hono/cors'
import { logger } from 'hono/logger'

app.use('*', cors())
app.use('*', logger())
```

## Why not just use fetch()?

You could. For a single route, raw `fetch` is fine. But once you have
path params, middleware, error handling, and HTML rendering, you want a router.
Hono adds essentially zero overhead (~14 kB gzipped) and makes the code readable.

## Type-safe bindings

```typescript
type Bindings = {
  KV:  KVNamespace
  DB:  D1Database
  R2:  R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/data', async (c) => {
  const val = await c.env.KV.get('key')
  return c.json({ val })
})
```

Full autocomplete on `c.env`. No casting, no guessing.

---

Next up: adding Three.js experiments to the 3D page. Should be fun.
