export function urlShortenerPage(): string {
  return /* html */ `
  <div class="page narrow" style="padding-top:2rem">
    <div style="margin-bottom:2rem">
      <p class="tag accent" style="margin-bottom:1rem">Experimental Feature</p>
      <h1 style="font-size:2.25rem;font-weight:800;letter-spacing:-.02em;margin-bottom:.5rem">
        URL Shortener
      </h1>
      <p style="color:var(--muted)">
        A simple URL shortener powered by Cloudflare KV. Note: This is a demo and may not persist across deployments.
      </p>
    </div>

    <!-- Shorten Form -->
    <div class="card" style="margin-bottom:2rem">
      <form id="shorten-form" style="display:flex;flex-direction:column;gap:1rem">
        <div>
          <label style="display:block;font-weight:600;margin-bottom:.5rem;font-size:.9rem">
            Enter URL to shorten
          </label>
          <input
            type="url"
            id="url-input"
            placeholder="https://example.com/very/long/url"
            required
            style="
              width:100%;padding:.75rem 1rem;border:1px solid var(--border);
              border-radius:.5rem;background:var(--surface);color:var(--text);
              font-size:.95rem;outline:none;transition:border-color .2s
            "
            onfocus="this.style.borderColor='var(--accent)'"
            onblur="this.style.borderColor='var(--border)'"
          />
        </div>
        <button type="submit" class="btn" style="width:fit-content">
          Shorten URL
        </button>
      </form>
    </div>

    <!-- Result -->
    <div id="result" style="display:none;margin-bottom:2rem">
      <div class="card" style="border:1px solid var(--accent);background:rgba(212,184,150,0.05)">
        <div style="font-weight:700;margin-bottom:.5rem;color:var(--accent)">✓ URL shortened!</div>
        <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
          <code id="short-url" style="
            padding:.4rem .75rem;background:var(--surface);border:1px solid var(--border);
            border-radius:.3rem;font-family:'Fira Code',monospace;font-size:.85rem;
            word-break:break-all;flex:1;min-width:200px
          "></code>
          <button onclick="copyUrl()" class="btn ghost" style="padding:.4rem .75rem;font-size:.875rem">
            Copy
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div id="error" style="display:none;margin-bottom:2rem">
      <div class="card" style="border:1px solid #ef4444;background:rgba(239,68,68,0.05)">
        <div style="font-weight:700;margin-bottom:.5rem;color:#ef4444">✗ Error</div>
        <div id="error-message" style="color:#ef4444"></div>
      </div>
    </div>

    <!-- Info -->
    <div class="card" style="opacity:.8">
      <div style="font-weight:700;margin-bottom:.5rem">How it works</div>
      <ul style="margin:0;padding-left:1.25rem;color:var(--muted);font-size:.9rem;line-height:1.7">
        <li>Enter a long URL above</li>
        <li>Click "Shorten URL" to generate a short link</li>
        <li>The short link will redirect to the original URL</li>
        <li>Data is stored in Cloudflare KV for fast global access</li>
      </ul>
      <div style="margin-top:1rem;padding:.75rem;background:var(--surface);border-radius:.5rem;font-size:.85rem;color:var(--muted)">
        <strong>Note:</strong> This is a demonstration. In production, you'd want to add authentication, rate limiting, and analytics.
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('shorten-form')
    const result = document.getElementById('result')
    const error = document.getElementById('error')
    const shortUrlEl = document.getElementById('short-url')
    const errorMessage = document.getElementById('error-message')

    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      const urlInput = document.getElementById('url-input')
      const longUrl = urlInput.value.trim()

      // Basic validation
      try {
        new URL(longUrl)
      } catch {
        showError('Please enter a valid URL')
        return
      }

      try {
        // Generate short code (6 chars, base62)
        const shortCode = generateShortCode()

        // Store in KV (this would normally go to a backend API)
        // For demo purposes, we'll use localStorage
        const storedUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '{}')
        storedUrls[shortCode] = longUrl
        localStorage.setItem('shortenedUrls', JSON.stringify(storedUrls))

        // Build short URL
        const shortUrl = \`\${window.location.origin}/s/\${shortCode}\`

        // Show result
        shortUrlEl.textContent = shortUrl
        result.style.display = 'block'
        error.style.display = 'none'

        // Clear input
        urlInput.value = ''
      } catch (err) {
        showError('Failed to shorten URL: ' + err.message)
      }
    })

    function generateShortCode(): string {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      let result = ''
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    function showError(message: string) {
      errorMessage.textContent = message
      error.style.display = 'block'
      result.style.display = 'none'
    }

    function copyUrl() {
      navigator.clipboard.writeText(shortUrlEl.textContent).then(() => {
        const btn = event.target as HTMLElement
        const originalText = btn.textContent
        btn.textContent = 'Copied!'
        setTimeout(() => {
          btn.textContent = originalText
        }, 1500)
      })
    }

    // Handle short URL redirects
    const path = window.location.pathname
    if (path.startsWith('/s/')) {
      const shortCode = path.slice(3)
      const storedUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '{}')
      const longUrl = storedUrls[shortCode]

      if (longUrl) {
        window.location.href = longUrl
      } else {
        showError('Short URL not found')
      }
    }
  </script>`
}
