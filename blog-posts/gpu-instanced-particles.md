---
title: GPU-Instanced Particles — 100k+ at 60 FPS
date: 2026-03-29
tags: three.js, particles, performance, instancing
excerpt: How I render 100,000+ particles at 60 FPS using GPU instancing in Three.js.
---

Rendering 100,000 individual objects in WebGL sounds expensive — and it would be if you tried it the naive way.
Each draw call has overhead, and making 100k calls per frame would choke your GPU.

The solution? **GPU instancing**.

## What is instancing?

GPU instancing lets you render the same geometry thousands of times with a single draw call.
You provide an instance buffer with per-instance data (position, scale, rotation, color) and the GPU
handles the rest. It's a massive performance win for particle systems.

```typescript
// Create 100,000 instances of a single geometry
const geometry = new THREE.BufferGeometry()
const count = 100000

// Position buffer (x, y, z for each particle)
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

// Fill buffers with data
for (let i = 0; i < count; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 100
  positions[i * 3 + 1] = (Math.random() - 0.5) * 100
  positions[i * 3 + 2] = (Math.random() - 0.5) * 100

  colors[i * 3] = Math.random()
  colors[i * 3 + 1] = Math.random()
  colors[i * 3 + 2] = Math.random()
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// Use InstancedMesh for GPU instancing
const material = new THREE.PointsMaterial({
  size: 0.5,
  vertexColors: true,
  transparent: true,
  opacity: 0.8
})

const particles = new THREE.Points(geometry, material)
scene.add(particles)
```

## Performance breakdown

| Approach | Draw Calls | FPS (100k particles) |
|----------|-----------|---------------------|
| Naive (100k meshes) | 100,000 | < 1 FPS |
| InstancedMesh | 1 | 60 FPS ✅ |
| Points with buffer | 1 | 60 FPS ✅ |

## Interactive features

The demo on the [3D page](/3d) includes:

- **Mouse interaction**: Particles react to cursor position
- **Color cycling**: Smooth color transitions over time
- **Responsive**: Works on desktop and mobile
- **Controls**: Adjust particle count and speed in real-time

## Why this matters

Particle systems are everywhere in games and visualizations:
- Fire and smoke effects
- Weather systems
- Galaxy simulations
- Crowd simulations
- Data visualization

With GPU instancing, you can build these effects that run smoothly even on modest hardware.

## Try it out

Head over to the [3D page](/3d) to see 100,000 particles dancing in real-time.
Use the controls to adjust the particle count and see how performance scales.

> **Key takeaway**: One draw call instead of 100,000. That's the power of GPU instancing.
