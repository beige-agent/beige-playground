export function threeDPage(): string {
  return /* html */ `
  <div class="page" style="padding-top:2rem">
    <div style="margin-bottom:2rem">
      <h1 style="font-size:2.25rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.5rem">3D Demos</h1>
      <p style="color:var(--muted)">Interactive WebGL experiments. All rendering happens in your browser.</p>
    </div>

    <!-- Canvas demo -->
    <div style="position:relative;border-radius:1rem;overflow:hidden;border:1px solid var(--border);background:#08080a;margin-bottom:1.5rem">
      <canvas id="three-canvas" style="width:100%;display:block;aspect-ratio:16/7"></canvas>
      <div id="three-loading" style="
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        color:var(--muted);font-size:.875rem;pointer-events:none
      ">Loading Three.js…</div>
      <div style="
        position:absolute;bottom:1rem;left:1rem;
        background:rgba(0,0,0,.5);backdrop-filter:blur(8px);
        border:1px solid var(--border);border-radius:.5rem;
        padding:.4rem .85rem;color:var(--muted);font-size:.75rem
      ">Move your cursor over the canvas</div>
    </div>

    <!-- Controls strip -->
    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:3rem">
      <button id="btn-geo"  class="btn ghost" onclick="cycleGeometry()">Cycle geometry</button>
      <button id="btn-wire" class="btn ghost" onclick="toggleWire()">Toggle wireframe</button>
      <button id="btn-color" class="btn ghost" onclick="randomColor()">Random colour</button>
    </div>

    <!-- Demo grid -->
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:1rem">Coming soon</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
      ${demoCard('🌊', 'Shader waves', 'GLSL fragment shader — animated noise displacement')}
      ${demoCard('✨', 'Particle cloud', 'GPU-instanced 200k particle system')}
      ${demoCard('🗺', 'Procedural terrain', 'Perlin noise heightmap with fog')}
      ${demoCard('🌀', 'Physics sandbox', 'Rapier WASM rigid bodies')}
    </div>
  </div>

  <!-- Three.js from CDN, deferred so page renders first -->
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
    }
  }
  </script>
  <script type="module">
    import * as THREE from 'three'

    const loader = document.getElementById('three-loading')
    const canvas  = document.getElementById('three-canvas')

    // ── Scene setup ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.set(0, 0, 4)

    // ── Lighting ─────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const dir = new THREE.DirectionalLight(0xffd0a0, 2.5)
    dir.position.set(3, 4, 3)
    scene.add(dir)
    const fill = new THREE.DirectionalLight(0xa0c8ff, 0.8)
    fill.position.set(-3, -2, -2)
    scene.add(fill)

    // ── Geometries we'll cycle through ───────────────────────────────
    const GEOS = [
      new THREE.TorusKnotGeometry(1, 0.35, 200, 24),
      new THREE.IcosahedronGeometry(1.2, 4),
      new THREE.OctahedronGeometry(1.3, 2),
      new THREE.TorusGeometry(1, 0.4, 40, 120),
      new THREE.SphereGeometry(1.3, 64, 64),
    ]
    let geoIdx = 0

    const mat = new THREE.MeshStandardMaterial({
      color: 0xd4b896,
      roughness: 0.3,
      metalness: 0.55,
    })

    let mesh = new THREE.Mesh(GEOS[geoIdx], mat)
    scene.add(mesh)

    // ── Mouse tracking ───────────────────────────────────────────────
    let mx = 0, my = 0
    document.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    })
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect()
      mx = ((e.clientX - r.left) / r.width  - 0.5) * 2
      my = ((e.clientY - r.top)  / r.height - 0.5) * 2
    })

    // ── Resize ───────────────────────────────────────────────────────
    function resize() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    new ResizeObserver(resize).observe(canvas)

    // ── Animate ──────────────────────────────────────────────────────
    let t = 0
    function animate() {
      requestAnimationFrame(animate)
      t += 0.01
      mesh.rotation.x += 0.003 + my * 0.002
      mesh.rotation.y += 0.005 + mx * 0.003
      mesh.position.y = Math.sin(t * 0.7) * 0.08
      renderer.render(scene, camera)
    }

    loader.style.display = 'none'
    animate()

    // ── Controls exposed to inline onclick handlers ───────────────────
    window.cycleGeometry = function() {
      geoIdx = (geoIdx + 1) % GEOS.length
      scene.remove(mesh)
      mesh = new THREE.Mesh(GEOS[geoIdx], mat)
      scene.add(mesh)
    }

    window.toggleWire = function() {
      mat.wireframe = !mat.wireframe
    }

    window.randomColor = function() {
      mat.color.setHSL(Math.random(), 0.6, 0.65)
    }
  </script>`
}

function demoCard(icon: string, title: string, desc: string): string {
  return /* html */ `
  <div class="card" style="opacity:.6">
    <div style="font-size:1.4rem;margin-bottom:.6rem">${icon}</div>
    <div style="font-weight:700;font-size:.95rem;margin-bottom:.3rem">${title}</div>
    <div style="color:var(--muted);font-size:.8rem">${desc}</div>
    <div style="margin-top:.75rem"><span class="tag">coming soon</span></div>
  </div>`
}
