export function terrainPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terrain · Beige Playground</title>
  <script src="https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0d0c0;
      overflow: hidden;
    }
    #canvas { width: 100vw; height: 100vh; display: block; }
    .overlay {
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(10, 10, 10, 0.9);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #3a3a3a;
      max-width: 280px;
      z-index: 100;
    }
    h1 { font-size: 1.4rem; margin-bottom: 0.5rem; color: #f0e6d8; }
    .stats { 
      font-family: monospace; 
      font-size: 0.85rem; 
      color: #a0a0a0;
      margin-top: 0.75rem;
    }
    .controls {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label { font-size: 0.8rem; color: #909090; }
    input[type="range"] {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      background: #2a2a2a;
      border-radius: 3px;
      outline: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      background: #e0d0c0;
      border-radius: 50%;
      cursor: pointer;
    }
    .btn-group {
      display: flex;
      gap: 8px;
      margin-top: 0.5rem;
    }
    button {
      flex: 1;
      padding: 8px 12px;
      background: #2a2a2a;
      color: #e0d0c0;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    button:hover { background: #3a3a3a; border-color: #4a4a4a; }
    button.active { background: #e0d0c0; color: #0a0a0a; }
    .legend {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #2a2a2a;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      margin-bottom: 4px;
    }
    .color-box {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    .back-link {
      position: fixed;
      bottom: 20px;
      left: 20px;
      color: #909090;
      text-decoration: none;
      font-size: 0.9rem;
      z-index: 100;
    }
    .back-link:hover { color: #e0d0c0; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  
  <div class="overlay">
    <h1>🏔️ Procedural Terrain</h1>
    <p style="font-size: 0.85rem; color: #a0a0a0;">
      Mouse drag to rotate • Scroll to zoom
    </p>
    <div class="stats">
      <div id="fps">FPS: 0</div>
      <div id="vertices">Vertices: 0</div>
      <div id="triangles">Triangles: 0</div>
    </div>
    
    <div class="controls">
      <div class="control-group">
        <label>Height Scale</label>
        <input type="range" id="heightScale" min="0.1" max="2" step="0.1" value="0.8">
      </div>
      
      <div class="control-group">
        <label>Noise Scale</label>
        <input type="range" id="noiseScale" min="0.01" max="0.05" step="0.005" value="0.02">
      </div>
      
      <div class="control-group">
        <label>Detail</label>
        <input type="range" id="detail" min="1" max="6" step="1" value="4">
      </div>
      
      <div class="control-group">
        <label>Water Level</label>
        <input type="range" id="waterLevel" min="0" max="0.5" step="0.05" value="0.2">
      </div>
      
      <div class="btn-group">
        <button id="regenerate">🔄 Regenerate</button>
        <button id="toggleWireframe">📐 Wireframe</button>
      </div>
      
      <div class="btn-group">
        <button id="low" onclick="setPreset('low')">Low</button>
        <button id="medium" class="active" onclick="setPreset('medium')">Medium</button>
        <button id="high" onclick="setPreset('high')">High</button>
      </div>
    </div>
    
    <div class="legend">
      <div class="legend-item">
        <div class="color-box" style="background: #1a4a6e;"></div>
        <span>Deep Water</span>
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #2d6a8a;"></div>
        <span>Water</span>
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #8b9a6b;"></div>
        <span>Grassland</span>
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #6b7a5b;"></div>
        <span>Forest</span>
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #8b7355;"></div>
        <span>Mountain</span>
      </div>
      <div class="legend-item">
        <div class="color-box" style="background: #e0e0e0;"></div>
        <span>Snow</span>
      </div>
    </div>
  </div>
  
  <a href="/" class="back-link">← Back to Playground</a>

  <script>
    // Simplex Noise Implementation
    class SimplexNoise {
      constructor(seed = Math.random()) {
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) this.p[i] = i;
        
        let n, q;
        for (let i = 255; i > 0; i--) {
          seed = (seed * 16807) % 2147483647;
          n = seed % (i + 1);
          q = this.p[i];
          this.p[i] = this.p[n];
          this.p[n] = q;
        }
        
        this.perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
      }
      
      noise2D(x, y) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;
        
        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;
        
        const i1 = x0 > y0 ? 1 : 0;
        const j1 = x0 > y0 ? 0 : 1;
        
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;
        
        const ii = i & 255;
        const jj = j & 255;
        
        let n0 = 0, n1 = 0, n2 = 0;
        
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
          const gi0 = this.perm[ii + this.perm[jj]] % 12;
          t0 *= t0;
          n0 = t0 * t0 * this.dot2(gi0, x0, y0);
        }
        
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
          const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
          t1 *= t1;
          n1 = t1 * t1 * this.dot2(gi1, x1, y1);
        }
        
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
          const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
          t2 *= t2;
          n2 = t2 * t2 * this.dot2(gi2, x2, y2);
        }
        
        return 70 * (n0 + n1 + n2);
      }
      
      dot2(gi, x, y) {
        const grad3 = [
          [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
          [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
          [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        return grad3[gi][0] * x + grad3[gi][1] * y;
      }
      
      fbm(x, y, octaves = 4, lacunarity = 2, persistence = 0.5) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
          value += amplitude * this.noise2D(x * frequency, y * frequency);
          maxValue += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }
        
        return value / maxValue;
      }
    }

    // Three.js Setup
    let scene, camera, renderer, terrain, water;
    let noise = new SimplexNoise();
    let frameCount = 0;
    let lastTime = performance.now();
    let isWireframe = false;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationY = 0;
    let rotationX = 0.5;
    let targetRotationY = 0;
    let targetRotationX = 0.5;
    let distance = 15;
    let targetDistance = 15;

    const colors = {
      deepWater: new THREE.Color(0x1a4a6e),
      water: new THREE.Color(0x2d6a8a),
      sand: new THREE.Color(0xc4b59d),
      grassland: new THREE.Color(0x8b9a6b),
      forest: new THREE.Color(0x6b7a5b),
      mountain: new THREE.Color(0x8b7355),
      snow: new THREE.Color(0xe0e0e0)
    };

    function init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = distance;

      renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'),
        antialias: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xe0d0c0, 0.5);
      pointLight.position.set(-5, 5, -5);
      scene.add(pointLight);

      createTerrain();
      createWater();
      
      setupEventListeners();
      animate();
    }

    function createTerrain() {
      const segments = 200;
      const size = 20;
      const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
      
      const positions = geometry.attributes.position.array;
      const colors = [];
      
      const heightScale = parseFloat(document.getElementById('heightScale').value);
      const noiseScale = parseFloat(document.getElementById('noiseScale').value);
      const detail = parseInt(document.getElementById('detail').value);
      const waterLevel = parseFloat(document.getElementById('waterLevel').value);

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        const height = noise.fbm(x * noiseScale, y * noiseScale, detail);
        const normalizedHeight = (height + 1) / 2;
        positions[i + 2] = normalizedHeight * heightScale;
        
        // Color based on height
        let color;
        if (normalizedHeight < waterLevel * 0.5) {
          color = colors.deepWater;
        } else if (normalizedHeight < waterLevel) {
          color = colors.water;
        } else if (normalizedHeight < waterLevel + 0.05) {
          color = colors.sand;
        } else if (normalizedHeight < 0.5) {
          color = colors.grassland;
        } else if (normalizedHeight < 0.7) {
          color = colors.forest;
        } else if (normalizedHeight < 0.85) {
          color = colors.mountain;
        } else {
          color = colors.snow;
        }
        
        colors.push(color.r, color.g, color.b);
      }
      
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      
      const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        wireframe: isWireframe,
        flatShading: false,
        side: THREE.DoubleSide
      });
      
      if (terrain) scene.remove(terrain);
      terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2;
      scene.add(terrain);

      document.getElementById('vertices').textContent = \`Vertices: \${positions.length / 3}\`;
      document.getElementById('triangles').textContent = \`Triangles: \${segments * segments * 2}\`;
    }

    function createWater() {
      const waterGeometry = new THREE.PlaneGeometry(20, 20);
      const waterMaterial = new THREE.MeshPhongMaterial({
        color: colors.water,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      
      if (water) scene.remove(water);
      water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.rotation.x = -Math.PI / 2;
      
      const waterLevel = parseFloat(document.getElementById('waterLevel').value);
      const heightScale = parseFloat(document.getElementById('heightScale').value);
      water.position.z = waterLevel * heightScale;
      scene.add(water);
    }

    function setupEventListeners() {
      const canvas = document.getElementById('canvas');
      
      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });
      
      canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        targetRotationX = Math.max(0, Math.min(Math.PI / 2, targetRotationX));
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });
      
      canvas.addEventListener('mouseup', () => isDragging = false);
      canvas.addEventListener('mouseleave', () => isDragging = false);
      
      canvas.addEventListener('wheel', (e) => {
        targetDistance += e.deltaY * 0.01;
        targetDistance = Math.max(5, Math.min(30, targetDistance));
        e.preventDefault();
      });
      
      document.getElementById('heightScale').addEventListener('input', () => {
        createTerrain();
        createWater();
      });
      
      document.getElementById('noiseScale').addEventListener('input', () => {
        createTerrain();
        createWater();
      });
      
      document.getElementById('detail').addEventListener('input', () => {
        createTerrain();
        createWater();
      });
      
      document.getElementById('waterLevel').addEventListener('input', () => {
        createTerrain();
        createWater();
      });
      
      document.getElementById('regenerate').addEventListener('click', () => {
        noise = new SimplexNoise();
        createTerrain();
        createWater();
      });
      
      document.getElementById('toggleWireframe').addEventListener('click', () => {
        isWireframe = !isWireframe;
        if (terrain) terrain.material.wireframe = isWireframe;
        document.getElementById('toggleWireframe').textContent = isWireframe ? '📐 Solid' : '📐 Wireframe';
      });
      
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    window.setPreset = function(preset) {
      document.querySelectorAll('.btn-group button').forEach(btn => btn.classList.remove('active'));
      document.getElementById(preset).classList.add('active');
      
      if (preset === 'low') {
        document.getElementById('detail').value = 2;
        document.getElementById('noiseScale').value = 0.01;
      } else if (preset === 'medium') {
        document.getElementById('detail').value = 4;
        document.getElementById('noiseScale').value = 0.02;
      } else if (preset === 'high') {
        document.getElementById('detail').value = 6;
        document.getElementById('noiseScale').value = 0.04;
      }
      
      createTerrain();
      createWater();
    };

    function animate() {
      requestAnimationFrame(animate);
      
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        document.getElementById('fps').textContent = \`FPS: \${frameCount}\`;
        frameCount = 0;
        lastTime = currentTime;
      }
      
      // Smooth camera movement
      rotationY += (targetRotationY - rotationY) * 0.1;
      rotationX += (targetRotationX - rotationX) * 0.1;
      distance += (targetDistance - distance) * 0.1;
      
      camera.position.x = distance * Math.sin(rotationY) * Math.cos(rotationX);
      camera.position.y = distance * Math.sin(rotationX);
      camera.position.z = distance * Math.cos(rotationY) * Math.cos(rotationX);
      camera.lookAt(0, 0, 0);
      
      // Animate water
      if (water) {
        water.position.z += Math.sin(Date.now() * 0.001) * 0.0002;
      }
      
      renderer.render(scene, camera);
    }

    init();
  </script>
</body>
</html>`;
}
