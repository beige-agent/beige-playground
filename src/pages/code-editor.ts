export function codeEditorPage(): string {
  // Default starter snippet shown on load
  const defaultCode = [
    '// Welcome to the Beige Code Editor!',
    '// Write JavaScript here and click ▶ Run (or Ctrl+Enter)',
    '',
    'const greet = (name) => `Hello, ${name}! 👋`;',
    '',
    'console.log(greet("world"));',
    '',
    '// Try some maths',
    'const fib = (n) => n <= 1 ? n : fib(n-1) + fib(n-2);',
    'console.log("Fibonacci sequence:");',
    'console.log([...Array(10).keys()].map(fib).join(", "));',
    '',
    '// DOM output',
    'output.innerHTML = `',
    '  <h2 style="color:#d4b896">Hello from Beige! 🤖</h2>',
    '  <p>Edit this code and press <kbd>Ctrl+Enter</kbd> to run it.</p>',
    '`;',
  ].join('\n')

  // We JSON-encode so it can be safely embedded in a JS string literal
  const defaultCodeJson = JSON.stringify(defaultCode)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Editor · Beige Playground</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #0d0d0f;
      --surface: #141417;
      --border:  #1f1f24;
      --accent:  #d4b896;
      --muted:   #7a756e;
      --text:    #e8e3dd;
      --radius:  0.6rem;
      --font:    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    html, body { height: 100%; overflow: hidden; background: var(--bg); color: var(--text); font-family: var(--font); }

    /* ── Top bar ── */
    .topbar {
      height: 52px;
      background: rgba(13,13,15,.95);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0 1.25rem;
      flex-shrink: 0;
    }
    .topbar-brand { font-weight: 700; font-size: 1rem; }
    .topbar-brand span { color: var(--accent); }
    .spacer { flex: 1; }
    .btn {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .4rem 1rem;
      border-radius: var(--radius);
      border: none; cursor: pointer; font-size: .85rem; font-weight: 600;
      transition: opacity .15s;
    }
    .btn:hover { opacity: .8; }
    .btn-run  { background: var(--accent); color: #111; }
    .btn-clear { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-reset { background: transparent; border: 1px solid var(--border); color: var(--muted); font-size: .8rem; }
    kbd {
      display: inline-block; padding: .1em .4em;
      border: 1px solid var(--border); border-radius: .25rem;
      font-size: .75rem; color: var(--muted); background: var(--surface);
    }

    /* ── Main layout ── */
    .workspace {
      display: flex;
      height: calc(100vh - 52px);
    }

    /* ── Editor pane ── */
    .editor-pane {
      flex: 1 1 55%;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border);
      min-width: 0;
    }
    .pane-header {
      height: 36px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 1rem;
      gap: .75rem;
      font-size: .8rem;
      color: var(--muted);
      flex-shrink: 0;
    }
    .pane-header .lang-badge {
      background: rgba(212,184,150,.12); color: var(--accent);
      padding: .15em .55em; border-radius: 9999px; font-size: .72rem; font-weight: 600;
    }
    #monaco-container { flex: 1; overflow: hidden; }

    /* ── Output pane ── */
    .output-pane {
      flex: 1 1 45%;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .output-tabs {
      height: 36px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: stretch;
      flex-shrink: 0;
    }
    .tab {
      padding: 0 1rem;
      font-size: .8rem;
      color: var(--muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      display: flex; align-items: center;
      transition: color .15s, border-color .15s;
      background: none; border-left: none; border-right: none; border-top: none;
    }
    .tab.active { color: var(--text); border-bottom-color: var(--accent); }
    .tab:hover:not(.active) { color: var(--text); }

    /* Console panel */
    #console-panel {
      flex: 1; overflow-y: auto; padding: .75rem 1rem;
      font-family: "Fira Code", "Cascadia Code", monospace;
      font-size: .82rem; line-height: 1.6;
      background: var(--bg);
    }
    .log-line { padding: .1rem 0; border-bottom: 1px solid rgba(255,255,255,.03); }
    .log-line.log-log   { color: #e8e3dd; }
    .log-line.log-info  { color: #7eb8d4; }
    .log-line.log-warn  { color: #d4c47e; }
    .log-line.log-error { color: #d47e7e; }
    .log-line.log-result { color: var(--accent); border-top: 1px solid var(--border); margin-top: .5rem; padding-top: .5rem; }
    .log-prefix { color: var(--muted); margin-right: .5rem; user-select: none; }
    .log-empty  { color: var(--muted); font-style: italic; padding: .5rem 0; }

    /* DOM preview panel */
    #dom-panel { flex: 1; background: #fff; display: none; }
    #dom-panel iframe { width: 100%; height: 100%; border: none; }

    /* ── Status bar ── */
    .statusbar {
      height: 24px;
      background: #1a1a1f;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 1rem;
      gap: 1.5rem;
      font-size: .72rem;
      color: var(--muted);
      flex-shrink: 0;
    }
    #status-msg { margin-left: auto; }
    #status-msg.ok   { color: #8bc98b; }
    #status-msg.err  { color: #d47e7e; }

    /* ── Back link ── */
    .back-link {
      position: fixed; bottom: 32px; left: 1.25rem;
      color: var(--muted); text-decoration: none; font-size: .85rem; z-index: 200;
    }
    .back-link:hover { color: var(--text); }

    @media (max-width: 700px) {
      .workspace { flex-direction: column; }
      .editor-pane { flex: 0 0 50%; border-right: none; border-bottom: 1px solid var(--border); }
      .output-pane { flex: 0 0 50%; }
    }
  </style>
</head>
<body>

<!-- Top bar -->
<div class="topbar">
  <a href="/" class="topbar-brand" style="text-decoration:none;color:inherit">beige<span>.</span>editor</a>
  <span style="font-size:.8rem;color:var(--muted)">Live JS sandbox &nbsp;<kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run</span>
  <div class="spacer"></div>
  <button class="btn btn-reset" id="btn-reset">↺ Reset</button>
  <button class="btn btn-clear" id="btn-clear">⊘ Clear</button>
  <button class="btn btn-run"   id="btn-run">▶ Run</button>
</div>

<div class="workspace">

  <!-- Editor pane -->
  <div class="editor-pane">
    <div class="pane-header">
      <span class="lang-badge">JS</span>
      <span>script.js</span>
    </div>
    <div id="monaco-container"></div>
  </div>

  <!-- Output pane -->
  <div class="output-pane">
    <div class="output-tabs">
      <button class="tab active" id="tab-console" onclick="switchTab('console')">Console</button>
      <button class="tab"        id="tab-dom"     onclick="switchTab('dom')">Preview</button>
    </div>
    <div id="console-panel"><div class="log-empty">Run your code to see output here.</div></div>
    <div id="dom-panel"><iframe id="dom-frame" sandbox="allow-scripts"></iframe></div>
    <div class="statusbar">
      <span id="status-time"></span>
      <span id="status-msg"></span>
    </div>
  </div>

</div>

<a href="/" class="back-link">← Playground</a>

<!-- Monaco Editor via CDN -->
<script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"></script>
<script>
// ── Boot Monaco ──────────────────────────────────────────────────────────────
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } })

const DEFAULT_CODE = ${defaultCodeJson}

let editor = null

require(['vs/editor/editor.main'], () => {
  monaco.editor.defineTheme('beige-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',        foreground: '5a5550', fontStyle: 'italic' },
      { token: 'keyword',        foreground: 'd4b896' },
      { token: 'string',         foreground: '8bc98b' },
      { token: 'number',         foreground: '7eb8d4' },
      { token: 'identifier',     foreground: 'e8e3dd' },
    ],
    colors: {
      'editor.background':           '#0d0d0f',
      'editor.foreground':           '#e8e3dd',
      'editor.lineHighlightBackground': '#141417',
      'editorLineNumber.foreground': '#3a3a40',
      'editorCursor.foreground':     '#d4b896',
      'editor.selectionBackground':  '#2a2a35',
      'editorIndentGuide.background': '#1f1f24',
      'editorWidget.background':     '#141417',
      'editorSuggestWidget.background': '#141417',
      'editorSuggestWidget.border':  '#1f1f24',
      'input.background':            '#1f1f24',
    }
  })

  editor = monaco.editor.create(document.getElementById('monaco-container'), {
    value: DEFAULT_CODE,
    language: 'javascript',
    theme: 'beige-dark',
    fontSize: 14,
    fontFamily: '"Fira Code", "Cascadia Code", monospace',
    fontLigatures: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'line',
    tabSize: 2,
    wordWrap: 'on',
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    padding: { top: 12 },
  })

  // Ctrl+Enter → Run
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
    () => runCode()
  )

  setStatus('Ready', 'ok')
})

// ── Tab switching ─────────────────────────────────────────────────────────────
let activeTab = 'console'
window.switchTab = function(name) {
  activeTab = name
  document.getElementById('tab-console').classList.toggle('active', name === 'console')
  document.getElementById('tab-dom').classList.toggle('active', name === 'dom')
  document.getElementById('console-panel').style.display = name === 'console' ? '' : 'none'
  document.getElementById('dom-panel').style.display     = name === 'dom'     ? 'flex' : 'none'
}
// set initial state
document.getElementById('dom-panel').style.display = 'none'

// ── Console capture ───────────────────────────────────────────────────────────
const logPanel = document.getElementById('console-panel')

function appendLog(level, args) {
  // Remove empty placeholder
  const empty = logPanel.querySelector('.log-empty')
  if (empty) empty.remove()

  const line = document.createElement('div')
  line.className = 'log-line log-' + level
  const prefix = { log: '›', info: 'ℹ', warn: '⚠', error: '✖', result: '=' }[level] || '›'
  line.innerHTML =
    '<span class="log-prefix">' + prefix + '</span>' +
    args.map(formatValue).join(' ')
  logPanel.appendChild(line)
  logPanel.scrollTop = logPanel.scrollHeight
}

function formatValue(v) {
  if (v === null) return '<span style="color:#7a756e">null</span>'
  if (v === undefined) return '<span style="color:#7a756e">undefined</span>'
  if (typeof v === 'string') return escHtml(v)
  if (typeof v === 'number') return '<span style="color:#7eb8d4">' + v + '</span>'
  if (typeof v === 'boolean') return '<span style="color:#d4b896">' + v + '</span>'
  if (v instanceof Error)
    return '<span style="color:#d47e7e">' + escHtml(v.name + ': ' + v.message) + '</span>'
  try { return '<span style="color:#a0c0a0">' + escHtml(JSON.stringify(v, null, 2)) + '</span>' }
  catch(_) { return escHtml(String(v)) }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
}

// ── Run code ──────────────────────────────────────────────────────────────────
function runCode() {
  const code = editor ? editor.getValue() : ''
  if (!code.trim()) return

  const t0 = performance.now()

  // Clear console
  logPanel.innerHTML = ''

  // Prepare a virtual DOM element the script can write into
  const outputDiv = document.createElement('div')

  // Intercept console methods
  const captured = { log: [], warn: [], error: [], info: [] }
  const fakeConsole = {}
  ;['log','info','warn','error'].forEach(method => {
    fakeConsole[method] = (...args) => {
      captured[method].push(args)
      appendLog(method, args)
    }
  })

  let returnValue
  let errorOccurred = false

  try {
    // Execute inside a Function to isolate scope slightly
    // We expose: console (captured), output (div the script can modify)
    const fn = new Function('console', 'output', code)
    returnValue = fn(fakeConsole, outputDiv)
  } catch(err) {
    errorOccurred = true
    appendLog('error', [err])
    setStatus('Error — ' + err.message, 'err')
  }

  if (!errorOccurred) {
    // Show return value if non-undefined
    if (returnValue !== undefined) {
      appendLog('result', [returnValue])
    }
    const ms = (performance.now() - t0).toFixed(1)
    setStatus('Done in ' + ms + ' ms', 'ok')
  }

  // Populate DOM preview
  const frame = document.getElementById('dom-frame')
  const frameDoc = frame.contentDocument || frame.contentWindow.document
  frameDoc.open()
  frameDoc.write(
    '<!DOCTYPE html><html><head><style>' +
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
    'padding:1.5rem;background:#fff;color:#111;line-height:1.6}' +
    'h1,h2,h3{margin-bottom:.5rem}' +
    'p{margin-bottom:.75rem}' +
    'kbd{background:#eee;border:1px solid #ccc;border-radius:3px;padding:.1em .4em;font-size:.85em}' +
    '</style></head><body>' +
    outputDiv.innerHTML +
    '</body></html>'
  )
  frameDoc.close()

  // If output was written, auto-switch to preview tab
  if (outputDiv.innerHTML.trim()) switchTab('dom')
}

function setStatus(msg, cls) {
  const el = document.getElementById('status-msg')
  el.textContent = msg
  el.className = cls || ''
  const now = new Date()
  document.getElementById('status-time').textContent =
    now.getHours().toString().padStart(2,'0') + ':' +
    now.getMinutes().toString().padStart(2,'0') + ':' +
    now.getSeconds().toString().padStart(2,'0')
}

// ── Toolbar buttons ───────────────────────────────────────────────────────────
document.getElementById('btn-run').addEventListener('click', runCode)

document.getElementById('btn-clear').addEventListener('click', () => {
  logPanel.innerHTML = '<div class="log-empty">Console cleared.</div>'
  const frame = document.getElementById('dom-frame')
  const d = frame.contentDocument || frame.contentWindow.document
  d.open(); d.write(''); d.close()
  setStatus('Cleared', '')
})

document.getElementById('btn-reset').addEventListener('click', () => {
  if (editor) editor.setValue(DEFAULT_CODE)
  logPanel.innerHTML = '<div class="log-empty">Editor reset to default.</div>'
  setStatus('Reset', '')
})
</script>
</body>
</html>`
}
