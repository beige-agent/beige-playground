export function shaderPlaygroundPage(): string {
  return `
  <div class="page">
    <header>
      <h1>GLSL Shader Playground</h1>
      <p style="color:var(--muted);margin-top:.5rem">
        Write WebGL fragment shaders and see them rendered in real-time.
      </p>
    </header>

    <div style="margin:2rem 0">
      <div class="card" style="padding:0;overflow:hidden">
        <div style="display:grid;grid-template-columns:1fr 1fr;height:600px">
          <!-- Editor Side -->
          <div style="display:flex;flex-direction:column">
            <div style="padding:1rem;background:rgba(0,0,0,0.2);border-bottom:1px solid var(--border)">
              <span style="font-weight:600">Fragment Shader</span>
              <button id="resetBtn" class="btn btn-sm" style="float:right">Reset</button>
            </div>
            <textarea id="shaderEditor" spellcheck="false"
              style="flex:1;padding:1rem;background:#0d0d0d;color:#f8f8f2;font-family:'Fira Code',monospace;font-size:13px;resize:none;border:none;outline:none;line-height:1.5;white-space:pre;overflow-x:auto">#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  
  // Create a pulsing gradient
  float t = sin(u_time * 2.0) * 0.5 + 0.5;
  vec3 color = mix(vec3(0.96, 0.87, 0.70), vec3(0.82, 0.70, 0.55), t);
  
  // Add some interesting pattern
  float pattern = sin(st.x * 10.0 + u_time) * cos(st.y * 10.0 + u_time);
  color += pattern * 0.1;
  
  gl_FragColor = vec4(color, 1.0);
}</textarea>
          </div>

          <!-- Preview Side -->
          <div style="display:flex;flex-direction:column">
            <div style="padding:1rem;background:rgba(0,0,0,0.2);border-bottom:1px solid var(--border)">
              <span style="font-weight:600">Live Preview</span>
              <span id="fps" style="float:right;color:var(--muted);font-size:0.875rem">60 FPS</span>
            </div>
            <canvas id="shaderCanvas" style="flex:1;width:100%;height:100%"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:1rem">Built-in Uniforms</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
        <div>
          <code style="background:rgba(0,0,0,0.3);padding:0.25rem 0.5rem;border-radius:4px">u_time</code>
          <p style="color:var(--muted);font-size:0.875rem;margin-top:0.25rem">Time in seconds since start</p>
        </div>
        <div>
          <code style="background:rgba(0,0,0,0.3);padding:0.25rem 0.5rem;border-radius:4px">u_resolution</code>
          <p style="color:var(--muted);font-size:0.875rem;margin-top:0.25rem">Canvas dimensions (vec2)</p>
        </div>
        <div>
          <code style="background:rgba(0,0,0,0.3);padding:0.25rem 0.5rem;border-radius:4px">gl_FragCoord</code>
          <p style="color:var(--muted);font-size:0.875rem;margin-top:0.25rem">Fragment pixel coordinates</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:1rem">Example Shaders</h3>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn" onclick="loadExample('gradient')">Gradient</button>
        <button class="btn" onclick="loadExample('plasma')">Plasma</button>
        <button class="btn" onclick="loadExample('circles')">Circles</button>
        <button class="btn" onclick="loadExample('waves')">Waves</button>
        <button class="btn" onclick="loadExample('voronoi')">Voronoi</button>
      </div>
    </div>

    <script>
      const canvas = document.getElementById('shaderCanvas');
      const editor = document.getElementById('shaderEditor');
      const fpsDisplay = document.getElementById('fps');
      const resetBtn = document.getElementById('resetBtn');

      let gl = canvas.getContext('webgl');
      let program;
      let animationId;
      let startTime = Date.now();
      let frameCount = 0;
      let lastFpsUpdate = startTime;

      const defaultShader = editor.value;

      const examples = {
        gradient: String.raw['#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float u_time;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 st = gl_FragCoord.xy / u_resolution.xy;\n  float t = sin(u_time) * 0.5 + 0.5;\n  vec3 color = mix(vec3(0.96, 0.87, 0.70), vec3(0.82, 0.70, 0.55), t);\n  gl_FragColor = vec4(color, 1.0);\n}'],
        plasma: String.raw['#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float u_time;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 st = gl_FragCoord.xy / u_resolution.xy;\n  st = st * 2.0 - 1.0;\n  st.x *= u_resolution.x / u_resolution.y;\n  \n  float v = sin(st.x * 10.0 + u_time);\n  v += sin((st.y * 10.0 + u_time) * 0.5);\n  v += sin((st.x + st.y) * 10.0 + u_time * 0.5);\n  vec2 pos = st * 10.0;\n  float v2 = sin(pos.x + u_time);\n  v2 += sin(pos.y + u_time * 0.5);\n  v2 += sin((pos.x + pos.y) + u_time * 0.5);\n  v += v2 * 0.5;\n  \n  vec3 color = vec3(sin(v), sin(v + 2.094), sin(v + 4.188)) * 0.5 + 0.5;\n  gl_FragColor = vec4(color, 1.0);\n}'],
        circles: String.raw['#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float u_time;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 st = gl_FragCoord.xy / u_resolution.xy;\n  st = st * 2.0 - 1.0;\n  st.x *= u_resolution.x / u_resolution.y;\n  \n  vec3 color = vec3(0.96, 0.87, 0.70);\n  \n  for (float i = 1.0; i < 5.0; i++) {\n    vec2 pos = vec2(sin(u_time * i * 0.7) * 0.7, cos(u_time * i * 0.5) * 0.5);\n    float d = length(st - pos);\n    float circle = smoothstep(0.3 / i, 0.3 / i - 0.02, d);\n    color = mix(color, vec3(0.82, 0.70, 0.55), circle);\n  }\n  \n  gl_FragColor = vec4(color, 1.0);\n}'],
        waves: String.raw['#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float u_time;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 st = gl_FragCoord.xy / u_resolution.xy;\n  \n  vec3 color = vec3(0.96, 0.87, 0.70);\n  \n  float wave1 = sin(st.x * 20.0 + u_time * 3.0) * 0.5 + 0.5;\n  float wave2 = sin(st.y * 15.0 + u_time * 2.0) * 0.5 + 0.5;\n  float wave3 = sin((st.x + st.y) * 10.0 + u_time * 4.0) * 0.5 + 0.5;\n  \n  float combined = wave1 * wave2 * wave3;\n  color = mix(color, vec3(0.82, 0.70, 0.55), combined * 0.8);\n  \n  gl_FragColor = vec4(color, 1.0);\n}'],
        voronoi: String.raw['#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float u_time;\nuniform vec2 u_resolution;\n\nvec2 random2(vec2 p) {\n  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);\n}\n\nvoid main() {\n  vec2 st = gl_FragCoord.xy / u_resolution.xy;\n  st *= 5.0;\n  \n  vec2 i_st = floor(st);\n  vec2 f_st = fract(st);\n  \n  float m_dist = 1.0;\n  vec2 m_point;\n  \n  for (int y = -1; y <= 1; y++) {\n    for (int x = -1; x <= 1; x++) {\n      vec2 neighbor = vec2(float(x), float(y));\n      vec2 point = random2(i_st + neighbor);\n      point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);\n      vec2 diff = neighbor + point - f_st;\n      float dist = length(diff);\n      if (dist < m_dist) {\n        m_dist = dist;\n        m_point = point;\n      }\n    }\n  }\n  \n  vec3 color = vec3(0.96, 0.87, 0.70);\n  color += m_point * vec3(0.82, 0.70, 0.55) * 0.5;\n  color = mix(color, vec3(0.82, 0.70, 0.55), 1.0 - smoothstep(0.0, 0.1, m_dist));\n  \n  gl_FragColor = vec4(color, 1.0);\n}']
      };

      function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compile error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      }

      function createProgram(fragmentSource) {
        const vertexShaderSource = String.raw['attribute vec2 a_position;\nvoid main() {\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}'];

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

        if (!vertexShader || !fragmentShader) return null;

        const prog = gl.createProgram();
        gl.attachShader(prog, vertexShader);
        gl.attachShader(prog, fragmentShader);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          console.error('Program link error:', gl.getProgramInfoLog(prog));
          return null;
        }

        return prog;
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      function render(time) {
        const elapsedTime = (time - startTime) / 1000;
        
        gl.useProgram(program);
        
        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        
        gl.uniform1f(timeLocation, elapsedTime);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        // FPS counter
        frameCount++;
        if (time - lastFpsUpdate >= 1000) {
          fpsDisplay.textContent = frameCount + ' FPS';
          frameCount = 0;
          lastFpsUpdate = time;
        }
        
        animationId = requestAnimationFrame(render);
      }

      function compileAndRun() {
        const fragmentSource = editor.value;
        const newProgram = createProgram(fragmentSource);
        
        if (newProgram) {
          if (program) gl.deleteProgram(program);
          program = newProgram;
          
          // Setup geometry
          const positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1, 1, 1
          ]), gl.STATIC_DRAW);
          
          const positionLocation = gl.getAttribLocation(program, 'a_position');
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          
          if (animationId) cancelAnimationFrame(animationId);
          requestAnimationFrame(render);
        }
      }

      window.loadExample = function(name) {
        if (examples[name]) {
          editor.value = examples[name];
          compileAndRun();
        }
      };

      // Auto-compile on input (debounced)
      let timeout;
      editor.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(compileAndRun, 500);
      });

      resetBtn.addEventListener('click', () => {
        editor.value = defaultShader;
        compileAndRun();
      });

      window.addEventListener('resize', () => {
        resize();
        gl.viewport(0, 0, canvas.width, canvas.height);
      });

      // Initialize
      resize();
      compileAndRun();
    </script>
  </div>`;
}
