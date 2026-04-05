---
title: Procedural Terrain with Perlin Noise
date: 2026-03-29
tags: three.js, procedural, noise, terrain
excerpt: Generating infinite, realistic terrain using Perlin noise and custom shaders.
---

What if you could generate an entire continent's worth of terrain with a few lines of code?
That's the power of **procedural generation** — creating content algorithmically rather than manually.

## The core technique: Perlin noise

Perlin noise is a gradient noise function that produces smooth, natural-looking random values.
It's the secret sauce behind procedural terrain, clouds, fire, and many other natural phenomena.

```typescript
// Simple Perlin noise implementation
function noise(x: number, y: number, z: number): number {
  // ... Perlin noise algorithm ...
  // Returns a value between -1 and 1
}

// Use noise to generate height
function getTerrainHeight(x: number, z: number): number {
  // Layer multiple octaves for detail
  let height = 0
  let amplitude = 1
  let frequency = 1

  for (let i = 0; i < 6; i++) {
    height += noise(x * frequency, 0, z * frequency) * amplitude
    amplitude *= 0.5  // Reduce amplitude for detail
    frequency *= 2   // Increase frequency for detail
  }

  return height
}
```

## Building the mesh

```typescript
const size = 100
const segments = 100
const geometry = new THREE.PlaneGeometry(size, size, segments, segments)

// Displace vertices based on noise
const vertices = geometry.attributes.position.array as Float32Array

for (let i = 0; i < vertices.length; i += 3) {
  const x = vertices[i]
  const z = vertices[i + 2]
  const y = getTerrainHeight(x, z)

  vertices[i + 1] = y  // Set Y (height)
}

geometry.computeVertexNormals()

// Create material with height-based coloring
const material = new THREE.MeshStandardMaterial({
  vertexColors: true,
  flatShading: true
})

// Color vertices based on height
const colors = []
const colorAttr = geometry.attributes.position.array as Float32Array

for (let i = 0; i < colorAttr.length; i += 3) {
  const height = colorAttr[i + 1]

  // Deep water → Water → Sand → Grass → Rock → Snow
  if (height < -2) colors.push(0.0, 0.2, 0.5)      // Deep water
  else if (height < 0) colors.push(0.1, 0.4, 0.7)  // Water
  else if (height < 2) colors.push(0.76, 0.7, 0.5)  // Sand
  else if (height < 6) colors.push(0.2, 0.6, 0.2)  // Grass
  else if (height < 10) colors.push(0.4, 0.4, 0.4)  // Rock
  else colors.push(1.0, 1.0, 1.0)                    // Snow
}

geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
```

## Adding atmosphere

Terrain looks flat without proper atmosphere. I added:

- **Fog**: `scene.fog = new THREE.FogExp2(0x87CEEB, 0.015)`
- **Directional light**: Simulates sunlight with shadows
- **Ambient light**: Fills in dark areas
- **Water plane**: Reflects the sky and creates depth

```typescript
// Fog for atmospheric depth
scene.fog = new THREE.FogExp2(0x87CEEB, 0.015)

// Sun with shadows
const sun = new THREE.DirectionalLight(0xffffff, 1)
sun.position.set(50, 100, 50)
sun.castShadow = true
scene.add(sun)

// Ambient for fill light
const ambient = new THREE.AmbientLight(0x404040, 0.5)
scene.add(ambient)
```

## Height-based biomes

The coloring system creates natural-looking biomes based on altitude:

```
High altitude
    ↓
   Snow (> 10)
    ↓
   Rock (6-10)
    ↓
   Grass (2-6)
    ↓
   Sand (0-2)
    ↓
   Water (-2 to 0)
    ↓
 Deep water (< -2)
```

This simple approach creates surprisingly realistic terrain without any manual modeling.

## Interactive controls

On the [3D page](/3d), you can:
- Rotate and zoom the terrain
- Adjust noise parameters (scale, octaves)
- Toggle wireframe mode to see the mesh structure
- Change time of day (sun position)

## Why procedural generation matters

Procedural terrain has endless applications:

- **Games**: Infinite worlds, roguelikes, Minecraft-style terrain
- **Simulations**: Erosion, weather, climate modeling
- **Architecture**: Landscape design, site planning
- **Visualization**: Scientific data, geographical information
- **Art**: Generative art, digital landscapes

## Performance considerations

- **Segment count**: Higher segments = more detail = slower performance
- **Octaves**: More octaves = more detail = more computation
- **LOD (Level of Detail)**: Use fewer segments for distant terrain
- **Culling**: Don't render terrain outside the camera view

## Try it out

Visit the [3D page](/3d) to explore procedurally generated terrain.
Use the controls to experiment with different noise parameters and see how the terrain changes.

> **Key insight**: With just a few lines of code and Perlin noise, you can generate infinite, unique landscapes.
