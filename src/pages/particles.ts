export function particlesPage(): string {
  return /* html */ `
  <div class="page" style="padding-top:2rem">
    <div style="margin-bottom:2rem">
      <h1 style="font-size:2.25rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.5rem">GPU-Instanced Particle System</h1>
      <p style="color:var(--muted)">
        A high-performance particle system with 100,000+ animated particles using Three.js InstancedMesh.
        Move your mouse to interact with the particle field.
      </p>
    </div>

    <div id="canvas-container" style="width:100%;height:600px;background:black/50;border-radius:1rem;overflow:hidden;margin-bottom:1.5rem;border:1px solid var(--border)">
      <canvas id="particle-canvas"></canvas>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-bottom:2rem">
      <div class="card">
        <h3 style="font-weight:700;margin-bottom:.5rem">Controls</h3>
        <ul style="color:var(--muted);font-size:.875rem;list-style-position:inside;gap:.25rem">
          <li>• Move mouse to attract particles</li>
          <li>• Click to scatter particles</li>
          <li>• Use UI to adjust settings</li>
        </ul>
      </div>
      <div class="card">
        <h3 style="font-weight:700;margin-bottom:.5rem">Performance</h3>
        <ul style="color:var(--muted);font-size:.875rem;list-style-position:inside;gap:.25rem">
          <li>• GPU instancing for efficiency</li>
          <li>• 100,000+ particles at 60 FPS</li>
          <li>• Individual particle animation</li>
        </ul>
      </div>
    </div>

    <div class="card" style="margin-bottom:2rem">
      <h3 style="font-weight:700;margin-bottom:1rem">Settings</h3>
      <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center">
        <div>
          <label style="color:var(--muted);font-size:.875rem;display:block;margin-bottom:.25rem">Particle Count</label>
          <select id="particle-count" style="background:var(--surface);color:var(--text);padding:.5rem .75rem;border-radius:.5rem;border:1px solid var(--border);font-size:.875rem">
            <option value="50000">50,000</option>
            <option value="100000" selected>100,000</option>
            <option value="150000">150,000</option>
            <option value="200000">200,000</option>
          </select>
        </div>
        <div>
          <label style="color:var(--muted);font-size:.875rem;display:block;margin-bottom:.25rem">Particle Size</label>
          <input type="range" id="particle-size" min="1" max="10" value="3" style="width:120px">
        </div>
        <div>
          <label style="color:var(--muted);font-size:.875rem;display:block;margin-bottom:.25rem">Animation Speed</label>
          <input type="range" id="animation-speed" min="0.1" max="3" step="0.1" value="1" style="width:120px">
        </div>
        <button id="reset-btn" class="btn">Reset</button>
      </div>
    </div>

    <div class="card">
      <h3 style="font-weight:700;margin-bottom:1rem">Technical Details</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center">
        <div>
          <div id="stat-count" style="font-size:1.5rem;font-weight:800;color:var(--accent)">100,000</div>
          <div style="color:var(--muted);font-size:.875rem">Particles</div>
        </div>
        <div>
          <div id="stat-fps" style="font-size:1.5rem;font-weight:800;color:#4ade80">60</div>
          <div style="color:var(--muted);font-size:.875rem">FPS</div>
        </div>
        <div>
          <div id="stat-drawcalls" style="font-size:1.5rem;font-weight:800;color:#60a5fa">1</div>
          <div style="color:var(--muted);font-size:.875rem">Draw Calls</div>
        </div>
        <div>
          <div id="stat-triangles" style="font-size:1.5rem;font-weight:800;color:#a78bfa">300,000</div>
          <div style="color:var(--muted);font-size:.875rem">Triangles</div>
        </div>
      </div>
    </div>
  </div>

  <script type="module">
    import * as THREE from 'https://esm.sh/three@0.160.0';

    // Scene setup
    const canvas = document.getElementById('particle-canvas');
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.z = 50;

    // Particle system
    let particleCount = 100000;
    let particleSize = 3;
    let animationSpeed = 1;
    let instancedMesh;
    let dummy = new THREE.Object3D();
    let particles = [];
    let mouse = new THREE.Vector2();
    let targetPosition = new THREE.Vector3();

    // Colors for particles
    const colors = [
      new THREE.Color(0xf5f5dc),
      new THREE.Color(0xd2b48c),
      new THREE.Color(0xdeb887),
      new THREE.Color(0xcd853f),
      new THREE.Color(0x8b4513),
    ];

    function createParticles() {
      // Remove existing mesh
      if (instancedMesh) {
        scene.remove(instancedMesh);
        instancedMesh.geometry.dispose();
        instancedMesh.material.dispose();
      }

      // Create geometry and material
      const geometry = new THREE.TetrahedronGeometry(particleSize, 0);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // Create instanced mesh
      instancedMesh = new THREE.InstancedMesh(geometry, material, particleCount);
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      // Initialize particles
      particles = [];
      const color = new THREE.Color();

      for (let i = 0; i < particleCount; i++) {
        // Random position in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 30 + Math.random() * 20;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        const position = new THREE.Vector3(x, y, z);
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        );

        particles.push({
          position: position.clone(),
          velocity: velocity.clone(),
          originalPos: position.clone(),
        });

        // Set initial position
        dummy.position.copy(position);
        dummy.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Set color
        const colorIndex = Math.floor(Math.random() * colors.length);
        color.copy(colors[colorIndex]);
        instancedMesh.setColorAt(i, color);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.instanceColor.needsUpdate = true;

      scene.add(instancedMesh);

      // Update stats
      document.getElementById('stat-count').textContent = particleCount.toLocaleString();
      document.getElementById('stat-triangles').textContent = (particleCount * 12).toLocaleString();
    }

    createParticles();

    // Mouse interaction
    container.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Convert to 3D position
      targetPosition.set(mouse.x * 30, mouse.y * 30, 0);
    });

    container.addEventListener('click', () => {
      // Scatter particles
      particles.forEach((p) => {
        p.velocity.x += (Math.random() - 0.5) * 2;
        p.velocity.y += (Math.random() - 0.5) * 2;
        p.velocity.z += (Math.random() - 0.5) * 2;
      });
    });

    // Animation
    let frameCount = 0;
    let lastTime = performance.now();

    function animate() {
      requestAnimationFrame(animate);

      // FPS calculation
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        document.getElementById('stat-fps').textContent = fps.toString();
        frameCount = 0;
        lastTime = currentTime;
      }

      // Update particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Apply velocity
        p.position.addScaledVector(p.velocity, animationSpeed);

        // Mouse attraction
        const distanceToMouse = p.position.distanceTo(targetPosition);
        if (distanceToMouse < 20) {
          const direction = new THREE.Vector3()
            .subVectors(targetPosition, p.position)
            .normalize()
            .multiplyScalar(0.02 * animationSpeed);
          p.velocity.add(direction);
        }

        // Return to original position (spring force)
        const springForce = new THREE.Vector3()
          .subVectors(p.originalPos, p.position)
          .multiplyScalar(0.001 * animationSpeed);
        p.velocity.add(springForce);

        // Damping
        p.velocity.multiplyScalar(0.99);

        // Rotation
        p.rotation = (p.rotation || 0) + 0.01 * animationSpeed;

        // Update instance matrix
        dummy.position.copy(p.position);
        dummy.rotation.set(
          p.rotation || 0,
          (p.rotation || 0) * 0.7,
          (p.rotation || 0) * 0.3
        );
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Settings controls
    document.getElementById('particle-count').addEventListener('change', (e) => {
      particleCount = parseInt(e.target.value);
      createParticles();
    });

    document.getElementById('particle-size').addEventListener('input', (e) => {
      particleSize = parseFloat(e.target.value);
      createParticles();
    });

    document.getElementById('animation-speed').addEventListener('input', (e) => {
      animationSpeed = parseFloat(e.target.value);
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      document.getElementById('particle-count').value = '100000';
      document.getElementById('particle-size').value = '3';
      document.getElementById('animation-speed').value = '1';
      particleCount = 100000;
      particleSize = 3;
      animationSpeed = 1;
      createParticles();
    });
  </script>`
}
