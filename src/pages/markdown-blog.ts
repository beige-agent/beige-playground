/**
 * Markdown Blog Page
 * Loads blog posts from markdown files in the blog-posts/ directory
 * Uses marked.js for markdown parsing
 */

export function markdownBlogPage(posts: any[]): string {
  const postsJson = JSON.stringify(posts)
  return `
  <div class="page">
    <header class="section" style="display: flex; justify-content: space-between; align-items: start; gap: 2rem; margin-bottom: 2rem">
      <div>
        <h1 class="section-title">Blog</h1>
        <p class="section-desc">
          Notes, experiments, and thoughts from building on the edge.
          Posts are written in markdown and loaded dynamically.
        </p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center">
        <a href="/rss" class="btn" style="display: inline-flex; align-items: center; gap: 0.5rem; white-space: nowrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/>
            <circle cx="5" cy="19" r="1"/>
          </svg>
          RSS Feed
        </a>
      </div>
    </header>

    <!-- Search Box -->
    <div style="margin-bottom: 2rem; position: sticky; top: 1rem; z-index: 10">
      <div style="display: flex; gap: 0.5rem; align-items: center; background: var(--surface); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--muted)">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          id="blog-search"
          placeholder="Search posts by title, tags, or content..."
          style="flex: 1; background: transparent; border: none; outline: none; font-size: 1rem; color: var(--text)"
        />
        <span id="search-count" style="color: var(--muted); font-size: 0.875rem; white-space: nowrap"></span>
      </div>
    </div>

    <div class="blog-list" id="blog-posts">
      ${posts.map(post => `
        <article class="blog-card" style="margin-bottom: 2rem" data-title="${post.title.toLowerCase()}" data-tags="${post.tags.join(' ')}" data-excerpt="${post.excerpt.toLowerCase()}">
          <div style="color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem">
            ${new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <h2 class="blog-title">
            <a href="/markdown/${post.slug}" class="blog-link">${post.title}</a>
          </h2>
          <p class="blog-excerpt">${post.excerpt}</p>
          <div class="blog-tags">
            ${post.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </article>
      `).join('')}
    </div>

    <div id="no-results" style="display: none; text-align: center; padding: 3rem; color: var(--muted)">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 1rem; opacity: 0.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <p style="margin: 0">No posts found matching your search.</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem">Try different keywords or browse all posts.</p>
    </div>

    <div style="background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); margin-top: 3rem">
      <h3 style="margin-bottom: 0.5rem">About This Blog</h3>
      <p style="color: var(--muted); font-size: 0.875rem; margin: 0">
        Posts are stored as <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px">.md</code> files in the <code style="background: var(--bg); padding: 0.125rem 0.375rem; border-radius: 4px">blog-posts/</code> directory.
        Front-matter at the top of each file defines metadata (title, date, tags, excerpt).
        The markdown content is parsed client-side using <a href="https://marked.js.org/" style="color: var(--accent)">marked.js</a>.
      </p>
    </div>

    <script>
      // Blog search functionality
      (function() {
        const searchInput = document.getElementById('blog-search');
        const blogPosts = document.getElementById('blog-posts');
        const noResults = document.getElementById('no-results');
        const searchCount = document.getElementById('search-count');
        const allPosts = ${postsJson};

        function searchPosts(query) {
          const lowerQuery = query.toLowerCase().trim();
          const searchTerms = lowerQuery.split(/\\s+/).filter(t => t.length > 0);

          if (searchTerms.length === 0) {
            // Show all posts
            showAllPosts();
            return;
          }

          // Score each post
          const scoredPosts = allPosts.map(post => {
            let score = 0;

            // Title matches (highest weight)
            if (post.title.toLowerCase().includes(lowerQuery)) {
              score += 100;
            }
            searchTerms.forEach(term => {
              if (post.title.toLowerCase().includes(term)) {
                score += 50;
              }
            });

            // Excerpt matches (medium weight)
            if (post.excerpt.toLowerCase().includes(lowerQuery)) {
              score += 30;
            }
            searchTerms.forEach(term => {
              if (post.excerpt.toLowerCase().includes(term)) {
                score += 15;
              }
            });

            // Tag matches (medium weight)
            post.tags.forEach(tag => {
              if (tag.toLowerCase().includes(lowerQuery)) {
                score += 25;
              }
              searchTerms.forEach(term => {
                if (tag.toLowerCase().includes(term)) {
                  score += 12;
                }
              });
            });

            // Content matches (lower weight)
            if (post.rawMarkdown.toLowerCase().includes(lowerQuery)) {
              score += 10;
            }
            searchTerms.forEach(term => {
              if (post.rawMarkdown.toLowerCase().includes(term)) {
                score += 5;
              }
            });

            return { post, score };
          });

          // Filter and sort
          const results = scoredPosts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.post);

          // Display results
          if (results.length === 0) {
            blogPosts.style.display = 'none';
            noResults.style.display = 'block';
            searchCount.textContent = '0 posts';
          } else {
            blogPosts.style.display = 'block';
            noResults.style.display = 'none';
            searchCount.textContent = results.length + ' post' + (results.length !== 1 ? 's' : '');
            renderPosts(results);
          }
        }

        function showAllPosts() {
          blogPosts.style.display = 'block';
          noResults.style.display = 'none';
          searchCount.textContent = allPosts.length + ' post' + (allPosts.length !== 1 ? 's' : '');
          renderPosts(allPosts);
        }

        function renderPosts(posts) {
          const html = posts.map(post => \`
            <article class="blog-card" style="margin-bottom: 2rem">
              <div style="color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem">
                \${new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <h2 class="blog-title">
                <a href="/markdown/\${post.slug}" class="blog-link">\${post.title}</a>
              </h2>
              <p class="blog-excerpt">\${post.excerpt}</p>
              <div class="blog-tags">
                \${post.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}
              </div>
            </article>
          \`).join('');
          blogPosts.innerHTML = html;
        }

        // Event listeners
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            searchPosts(e.target.value);
          });

          // Focus search on load
          searchInput.focus();

          // Show initial count
          searchCount.textContent = allPosts.length + ' post' + (allPosts.length !== 1 ? 's' : '');
        }
      })();
    </script>
  </div>
  `
}

export function markdownBlogPostPage(post: any): string {
  return `
  <div class="page">
    <div style="margin-bottom: 2rem">
      <a href="/markdown" style="color: var(--muted); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        All posts
      </a>
    </div>

    <article class="blog-post">
      <header style="margin-bottom: 2rem">
        <div style="color: var(--muted); font-size: 0.875rem; margin-bottom: 0.5rem">
          ${new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <h1 style="font-size: 2.5rem; margin: 0 0 1rem 0; line-height: 1.2">${post.title}</h1>
        <div class="blog-tags">
          ${post.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </header>

      <div class="blog-content" id="markdown-content">
        ${post.rawMarkdown}
      </div>

      <footer style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border)">
        <a href="/markdown" class="btn" style="display: inline-flex; align-items: center; gap: 0.5rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to all posts
        </a>
      </footer>
    </article>

    <script>
      // Parse markdown content on the client side
      (async () => {
        if (typeof marked === 'undefined') {
          // Load marked.js from CDN if not available
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Parse and render markdown
        const markdownContent = document.getElementById('markdown-content');
        if (markdownContent && typeof marked !== 'undefined') {
          markdownContent.innerHTML = marked.parse(markdownContent.textContent);
        }
      })();
    </script>

    <style>
      .blog-content {
        line-height: 1.75;
      }

      .blog-content h2 {
        font-size: 1.75rem;
        margin-top: 2.5rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.5rem;
      }

      .blog-content h3 {
        font-size: 1.375rem;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
      }

      .blog-content p {
        margin-bottom: 1rem;
      }

      .blog-content ul,
      .blog-content ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
      }

      .blog-content li {
        margin-bottom: 0.5rem;
      }

      .blog-content pre {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
        font-size: 0.875rem;
      }

      .blog-content code {
        background: var(--bg);
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        font-size: 0.875em;
      }

      .blog-content pre code {
        background: none;
        padding: 0;
        border-radius: 0;
      }

      .blog-content a {
        color: var(--accent);
        text-decoration: none;
      }

      .blog-content a:hover {
        text-decoration: underline;
      }

      .blog-content blockquote {
        border-left: 4px solid var(--accent);
        padding-left: 1rem;
        margin: 1.5rem 0;
        color: var(--muted);
        font-style: italic;
      }

      .blog-content hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 2rem 0;
      }
    </style>
  </div>
  `
}
