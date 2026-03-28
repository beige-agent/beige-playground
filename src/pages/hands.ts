export function handsPage(): string {
  return /* html */ `
  <div style="margin:0;padding:0;background:#0a0a0c;min-height:100vh;display:flex;flex-direction:column">

    <!-- Minimal top bar -->
    <div style="
      display:flex;align-items:center;justify-content:space-between;
      padding:.75rem 1.5rem;
      background:rgba(10,10,12,.9);
      border-bottom:1px solid #1a1a20;
      position:fixed;top:0;left:0;right:0;z-index:50;
      backdrop-filter:blur(10px);
    ">
      <a href="/" style="color:#7a756e;text-decoration:none;font-size:.875rem;font-weight:600;letter-spacing:.02em">
        ← beige.playground
      </a>
      <span style="font-size:.875rem;font-weight:700;color:#d4b896;letter-spacing:.04em">HAND PARTICLES</span>
      <div id="status-dot" style="display:flex;align-items:center;gap:.5rem;font-size:.75rem;color:#7a756e">
        <span id="status-text">Initialising…</span>
        <div id="dot" style="width:8px;height:8px;border-radius:50%;background:#333;transition:background .3s"></div>
      </div>
    </div>

    <!-- Main canvas area -->
    <div style="position:relative;flex:1;margin-top:49px">
      <!-- Three.js particle canvas (full viewport) -->
      <canvas id="three-canvas" style="position:fixed;top:49px;left:0;right:0;bottom:0;width:100%;height:calc(100vh - 49px)"></canvas>

      <!-- Camera feed (small pip, bottom-right) -->
      <div style="position:fixed;bottom:1.5rem;right:1.5rem;z-index:20;border-radius:.75rem;overflow:hidden;border:1px solid #1f1f24;box-shadow:0 8px 32px rgba(0,0,0,.6)">
        <video id="cam" autoplay playsinline muted style="width:200px;height:150px;display:block;object-fit:cover;transform:scaleX(-1)"></video>
        <canvas id="landmark-canvas" style="position:absolute;inset:0;width:200px;height:150px;transform:scaleX(-1)"></canvas>
      </div>

      <!-- Gesture readout overlay -->
      <div style="position:fixed;bottom:1.5rem;left:1.5rem;z-index:20">
        <div style="
          background:rgba(10,10,12,.8);backdrop-filter:blur(8px);
          border:1px solid #1f1f24;border-radius:.75rem;
          padding:.875rem 1.25rem;min-width:180px;
        ">
          <div style="font-size:.7rem;font-weight:700;letter-spacing:.1em;color:#7a756e;text-transform:uppercase;margin-bottom:.6rem">
            Gesture
          </div>
          <div id="gesture-name" style="font-size:1.5rem;font-weight:800;color:#d4b896;line-height:1">
            —
          </div>
          <div id="gesture-desc" style="font-size:.75rem;color:#4a4540;margin-top:.35rem">
            Show your hand to the camera
          </div>
        </div>

        <div style="
          background:rgba(10,10,12,.8);backdrop-filter:blur(8px);
          border:1px solid #1f1f24;border-radius:.75rem;
          padding:.875rem 1.25rem;margin-top:.5rem;min-width:180px;
        ">
          <div style="font-size:.7rem;font-weight:700;letter-spacing:.1em;color:#7a756e;text-transform:uppercase;margin-bottom:.6rem">
            Gestures
          </div>
          ${hint('✋', 'Open hand', 'explode outward')}
          ${hint('✊', 'Fist', 'collapse inward')}
          ${hint('☝️', 'Point', 'beam trail')}
          ${hint('✌️', 'Peace', 'colour shift')}
          ${hint('🤙', 'Hang loose', 'slow spiral')}
        </div>
      </div>
    </div>
  </div>

  <!-- MediaPipe via CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>

  <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"}}</script>

  <script type="module">
    import * as THREE from 'three'

    // ─── DOM refs ────────────────────────────────────────────────────────────────
    const threeCanvas     = document.getElementById('three-canvas')
    const camEl           = document.getElementById('cam')
    const lmCanvas        = document.getElementById('landmark-canvas')
    const lmCtx           = lmCanvas.getContext('2d')
    const gestureName     = document.getElementById('gesture-name')
    const gestureDesc     = document.getElementById('gesture-desc')
    const statusText      = document.getElementById('status-text')
    const dot             = document.getElementById('dot')

    function setStatus(text, color) {
      statusText.textContent = text
      dot.style.background   = color
    }

    // ─── Three.js setup ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a0a0c, 1)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.z = 5

    function resize() {
      const w = threeCanvas.clientWidth, h = threeCanvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    new ResizeObserver(resize).observe(threeCanvas)

    // ─── Particle system ─────────────────────────────────────────────────────────
    const N = 8000
    const positions   = new Float32Array(N * 3)
    const velocities  = new Float32Array(N * 3)   // actual vx, vy, vz
    const basePos     = new Float32Array(N * 3)   // home positions
    const colors      = new Float32Array(N * 3)

    // Palette: warm beige / amber / lavender / teal
    const PALETTES = [
      [ [0.83,0.72,0.59], [0.95,0.80,0.55], [0.70,0.60,0.80], [0.55,0.75,0.80] ], // default warm
      [ [0.90,0.30,0.30], [1.00,0.55,0.20], [1.00,0.80,0.10], [0.30,0.80,0.40] ], // fire/peace
      [ [0.20,0.60,1.00], [0.40,0.90,0.90], [0.20,0.40,0.80], [0.60,0.80,1.00] ], // cool/fist
      [ [1.00,1.00,1.00], [0.85,0.95,1.00], [0.70,0.85,1.00], [0.55,0.70,0.90] ], // white/beam
      [ [0.60,0.20,0.90], [0.80,0.40,1.00], [0.40,0.10,0.70], [0.90,0.60,1.00] ], // purple/spiral
    ]
    let currentPalette = 0
    let targetPalette  = 0
    let paletteLerp    = 1.0

    function randomInSphere(r) {
      const u = Math.random(), v = Math.random(), theta = 2*Math.PI*u, phi = Math.acos(2*v-1)
      const rr = r * Math.cbrt(Math.random())
      return [rr*Math.sin(phi)*Math.cos(theta), rr*Math.sin(phi)*Math.sin(theta), rr*Math.cos(phi)]
    }

    for (let i = 0; i < N; i++) {
      const [x,y,z] = randomInSphere(3)
      positions[i*3]=basePos[i*3]=x; positions[i*3+1]=basePos[i*3+1]=y; positions[i*3+2]=basePos[i*3+2]=z
      velocities[i*3]=0; velocities[i*3+1]=0; velocities[i*3+2]=0
      const pal = PALETTES[0]
      const c = pal[i % pal.length]
      colors[i*3]=c[0]; colors[i*3+1]=c[1]; colors[i*3+2]=c[2]
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3))

    const mat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // Subtle ambient light effect — a dim sphere in the background
    const bgGeo = new THREE.SphereGeometry(8, 32, 32)
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x0d0a15, side: THREE.BackSide })
    scene.add(new THREE.Mesh(bgGeo, bgMat))

    // ─── Hand state ───────────────────────────────────────────────────────────────
    let handX = 0, handY = 0           // normalised [-1, 1] mapped from camera
    let handPresent  = false
    let gesture      = 'none'
    let gestureTimer = 0

    // Gesture-driven physics params
    let modePush     = 0   // 0..1 — open hand push
    let modeCollapse = 0   // fist
    let modeBeam     = 0   // point
    let modeSwirl    = 0   // hang loose / peace

    // ─── Gesture classification ───────────────────────────────────────────────────
    // MediaPipe gives 21 landmarks per hand
    // We compare tip y vs pip y to determine which fingers are up
    const TIP  = [4, 8, 12, 16, 20]
    const PIP  = [3, 6, 10, 14, 18]

    function fingersUp(lm) {
      // Thumb: compare tip.x to pip.x (mirror for right hand)
      const thumb = lm[4].x < lm[3].x   // tip is to the left of pip in mirrored feed
      const others = [1,2,3,4].map(i => lm[TIP[i]].y < lm[PIP[i]].y)
      return [thumb, ...others]  // [thumb, index, middle, ring, pinky]
    }

    function classifyGesture(lm) {
      const [thumb, idx, mid, ring, pinky] = fingersUp(lm)
      const count = [thumb,idx,mid,ring,pinky].filter(Boolean).length

      if (count >= 4)                                  return 'open'
      if (!thumb && !idx && !mid && !ring && !pinky)   return 'fist'
      if (!thumb && idx && !mid && !ring && !pinky)    return 'point'
      if (!thumb && idx && mid && !ring && !pinky)     return 'peace'
      if (thumb && !idx && !mid && !ring && pinky)     return 'hangloos'
      return 'other'
    }

    // ─── Update loop params ───────────────────────────────────────────────────────
    let noiseT = 0
    const rng  = (s=1) => (Math.random()-0.5)*2*s

    function lerp(a,b,t){ return a+(b-a)*t }

    // Simple 3-octave pseudo-noise for base drift
    function noise(x,y,z,t) {
      return (Math.sin(x*1.3+t)*Math.cos(y*0.9-t*0.7)+Math.sin(z*1.1+t*1.3)) * 0.33
    }

    // ─── Animate ─────────────────────────────────────────────────────────────────
    let frame = 0
    function animate() {
      requestAnimationFrame(animate)
      frame++
      noiseT += 0.004

      // Lerp gesture modes toward targets
      const tPush     = gesture==='open'     ? 1 : 0
      const tCollapse = gesture==='fist'     ? 1 : 0
      const tBeam     = gesture==='point'    ? 1 : 0
      const tSwirl    = (gesture==='hangloos'||gesture==='peace') ? 1 : 0

      const spd = 0.06
      modePush     = lerp(modePush,     tPush,     spd)
      modeCollapse = lerp(modeCollapse, tCollapse, spd)
      modeBeam     = lerp(modeBeam,     tBeam,     spd)
      modeSwirl    = lerp(modeSwirl,    tSwirl,    spd)

      // Palette lerp
      if (paletteLerp < 1.0) paletteLerp = Math.min(1, paletteLerp + 0.015)
      const fromPal = PALETTES[currentPalette]
      const toPal   = PALETTES[targetPalette]

      // Hand world-space pos (map from [-1,1] screen to scene units)
      const aspect = camera.aspect
      const hx =  handX * aspect * 2.5
      const hy = -handY * 2.5  // flip Y

      for (let i = 0; i < N; i++) {
        const i3 = i*3
        let px = positions[i3], py = positions[i3+1], pz = positions[i3+2]
        let vx = velocities[i3], vy = velocities[i3+1], vz = velocities[i3+2]

        // ── 1. Base ambient noise drift ────────────────────────────────────────
        const nx = noise(px, py, pz,  noiseT)
        const ny = noise(py, pz, px, -noiseT*0.8)
        const nz = noise(pz, px, py,  noiseT*0.6)
        vx += nx * 0.0012
        vy += ny * 0.0012
        vz += nz * 0.0012

        // ── 2. Spring back to home position (gentle) ───────────────────────────
        const bx = basePos[i3], by = basePos[i3+1], bz = basePos[i3+2]
        const springK = 0.004
        vx += (bx - px) * springK
        vy += (by - py) * springK
        vz += (bz - pz) * springK

        // ── 3. Hand influence ──────────────────────────────────────────────────
        if (handPresent) {
          const dx = px - hx, dy = py - hy, dz = pz
          const dist2 = dx*dx + dy*dy + dz*dz + 0.01
          const dist  = Math.sqrt(dist2)
          const invD  = 1/dist2

          // Gravity-like attract toward hand — always present when hand is visible
          const attract = 0.004 * invD
          vx -= dx * attract * 0.3
          vy -= dy * attract * 0.3

          // ── Open hand: strong radial push ─────────────────────────────────
          if (modePush > 0.01) {
            const push = modePush * 0.06 * invD
            vx += dx * push
            vy += dy * push
            vz += dz * push
          }

          // ── Fist: collapse toward hand ─────────────────────────────────────
          if (modeCollapse > 0.01) {
            const col = modeCollapse * 0.08 / (dist + 0.5)
            vx -= dx * col
            vy -= dy * col
            vz += rng(0.001)
          }

          // ── Point: beam — push particles sideways away from a ray ─────────
          if (modeBeam > 0.01) {
            // ray from hand pointing toward camera (z axis)
            // lateral dist to ray = sqrt(dx^2 + dy^2)
            const lateralD2 = dx*dx + dy*dy + 0.01
            const lateralD  = Math.sqrt(lateralD2)
            const beamStr   = modeBeam * 0.025 / (lateralD + 0.3)
            vx += dx/lateralD * beamStr
            vy += dy/lateralD * beamStr
            vz -= pz * 0.01 * modeBeam  // flatten toward hand plane
          }

          // ── Swirl: tangential force ────────────────────────────────────────
          if (modeSwirl > 0.01) {
            const tangX = -dy / (dist + 0.1)
            const tangY =  dx / (dist + 0.1)
            const swirlStr = modeSwirl * 0.012 / (dist + 0.5)
            vx += tangX * swirlStr
            vy += tangY * swirlStr
          }
        }

        // ── 4. Damping ─────────────────────────────────────────────────────────
        const damp = 0.94
        vx *= damp; vy *= damp; vz *= damp

        // ── 5. Integrate ───────────────────────────────────────────────────────
        px += vx; py += vy; pz += vz

        // Soft boundary — nudge back if too far
        const r2 = px*px+py*py+pz*pz
        if (r2 > 16) { const r=Math.sqrt(r2); px*=4/r; py*=4/r; pz*=4/r; vx*=.5;vy*=.5;vz*=.5 }

        positions[i3]   = px
        positions[i3+1] = py
        positions[i3+2] = pz
        velocities[i3]  = vx
        velocities[i3+1]= vy
        velocities[i3+2]= vz

        // ── 6. Colour ──────────────────────────────────────────────────────────
        const fromC = fromPal[i % fromPal.length]
        const toC   = toPal  [i % toPal.length]
        // Small per-particle shimmer
        const shimmer = (Math.sin(noiseT*3 + i*0.41) * 0.5 + 0.5) * 0.15
        colors[i3]   = lerp(fromC[0], toC[0], paletteLerp) + shimmer * 0.2
        colors[i3+1] = lerp(fromC[1], toC[1], paletteLerp) + shimmer * 0.1
        colors[i3+2] = lerp(fromC[2], toC[2], paletteLerp) + shimmer * 0.1
      }

      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate    = true

      // Slow rotation of the whole cloud
      points.rotation.y += 0.0008
      points.rotation.x += 0.0002

      renderer.render(scene, camera)
    }
    animate()

    // ─── MediaPipe hands ─────────────────────────────────────────────────────────
    const GESTURE_NAMES = {
      open:     ['✋ Open hand',  'particles explode outward'],
      fist:     ['✊ Fist',       'collapse & swallow'],
      point:    ['☝️ Pointing',   'beam tears through field'],
      peace:    ['✌️ Peace',      'colour shift + swirl'],
      hangloos: ['🤙 Hang loose', 'slow purple spiral'],
      other:    ['🖐 Moving…',    'hand is influencing field'],
      none:     ['—',             'Show your hand to the camera'],
    }

    const GESTURE_PALETTE = {
      open:     0,
      fist:     2,
      point:    3,
      peace:    1,
      hangloos: 4,
      other:    0,
      none:     0,
    }

    function applyGesture(g) {
      if (g === gesture) return
      gesture = g
      const [name, desc] = GESTURE_NAMES[g] || GESTURE_NAMES.none
      gestureName.textContent = name
      gestureDesc.textContent = desc

      const palIdx = GESTURE_PALETTE[g] ?? 0
      if (palIdx !== targetPalette) {
        currentPalette = targetPalette
        targetPalette  = palIdx
        paletteLerp    = 0
      }
    }

    // Wait for MediaPipe scripts to fully load
    function waitForMediaPipe(cb) {
      if (window.Hands) { cb(); return }
      setTimeout(() => waitForMediaPipe(cb), 100)
    }

    waitForMediaPipe(() => {
      setStatus('Camera…', '#f59e0b')

      const hands = new Hands({
        locateFile: (f) => 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + f
      })
      hands.setOptions({
        maxNumHands:          1,
        modelComplexity:      1,
        minDetectionConfidence:  0.7,
        minTrackingConfidence:   0.7,
      })

      hands.onResults((results) => {
        // Clear landmark overlay
        lmCtx.clearRect(0, 0, lmCanvas.width, lmCanvas.height)

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const lm = results.multiHandLandmarks[0]
          handPresent = true

          // Draw skeleton on pip canvas
          drawConnectors(lmCtx, lm, HAND_CONNECTIONS, { color: 'rgba(212,184,150,.6)', lineWidth: 1.5 })
          drawLandmarks(lmCtx,  lm, { color: '#d4b896', lineWidth: 1, radius: 2 })

          // Palm centre = average of wrist + MCP joints
          const palm = lm[0]
          // Camera is mirrored, so flip X
          handX = -(palm.x - 0.5) * 2
          handY =  (palm.y - 0.5) * 2

          const g = classifyGesture(lm)
          applyGesture(g)

          setStatus('Hand detected ✓', '#10b981')
        } else {
          handPresent = false
          applyGesture('none')
          setStatus('No hand', '#6b7280')
        }
      })

      const cam = new Camera(camEl, {
        onFrame: async () => { await hands.send({ image: camEl }) },
        width: 320, height: 240,
      })
      cam.start().then(() => setStatus('Running', '#10b981'))
              .catch(err => {
                setStatus('Camera denied', '#ef4444')
                console.error(err)
              })
    })

    // Set landmark canvas size to match video
    lmCanvas.width  = 200
    lmCanvas.height = 150
  </script>`
}

function hint(emoji: string, name: string, effect: string): string {
  return /* html */ `
  <div style="display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.4rem">
    <span style="font-size:.9rem;flex-shrink:0">${emoji}</span>
    <div>
      <span style="font-size:.75rem;color:#a09890;font-weight:600">${name}</span>
      <span style="font-size:.7rem;color:#4a4540;display:block">${effect}</span>
    </div>
  </div>`
}
