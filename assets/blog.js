(function () {
  const DAILY_TRIGGER_COUNT = 5;
  let currentMode = "tech";
  let nicknameClicks = 0;
  let posts = [];

  const copy = {
    tech: {
      label: "技术博客",
      title: "把问题拆开，把答案写清楚",
      description: "这里是 Feather 的技术笔记、项目复盘和学习记录。先用模板占位，之后会慢慢换成真实内容。",
      empty: "技术文章正在整理中。",
    },
    daily: {
      label: "日常记录",
      title: "一些轻一点的日常",
      description: "这里收着不必太正式的片段、散步、想法和备忘。刷新页面后会回到技术博客。",
      empty: "日常片段还在路上。",
    },
  };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderInlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  function markdownToHtml(markdown) {
    const lines = markdown.split(/\r?\n/);
    const html = [];
    let paragraph = [];
    let list = [];
    let code = [];
    let inCode = false;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    };

    const flushList = () => {
      if (!list.length) return;
      html.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
      list = [];
    };

    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        if (inCode) {
          html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
          code = [];
          inCode = false;
        } else {
          flushParagraph();
          flushList();
          inCode = true;
        }
        continue;
      }

      if (inCode) {
        code.push(line);
        continue;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        continue;
      }

      if (trimmed.startsWith("# ")) {
        flushParagraph();
        flushList();
        html.push(`<h1>${renderInlineMarkdown(trimmed.slice(2))}</h1>`);
        continue;
      }

      if (trimmed.startsWith("## ")) {
        flushParagraph();
        flushList();
        html.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
        continue;
      }

      if (trimmed.startsWith("- ")) {
        flushParagraph();
        list.push(trimmed.slice(2));
        continue;
      }

      paragraph.push(trimmed);
    }

    if (inCode) {
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    }
    flushParagraph();
    flushList();
    return html.join("");
  }

  function getVisiblePosts() {
    return posts
      .filter((post) => post.mode === currentMode)
      .sort((left, right) => right.date.localeCompare(left.date));
  }

  function postCard(post, featured) {
    const tags = post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="${featured ? "featured-card" : "post-card"}">
        <div class="post-meta">${escapeHtml(post.date)} · ${tags}</div>
        <h3><a href="#/post/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h3>
        <p>${escapeHtml(post.summary)}</p>
      </article>
    `;
  }

  function syncModeCopy() {
    const modeCopy = copy[currentMode];
    const modeLabel = $("mode-label");
    const heroTitle = $("hero-title");
    const heroDescription = $("hero-description");
    if (modeLabel) modeLabel.textContent = modeCopy.label;
    if (heroTitle) heroTitle.textContent = modeCopy.title;
    if (heroDescription) heroDescription.textContent = modeCopy.description;
    document.documentElement.dataset.contentMode = currentMode;
  }

  function renderHome() {
    syncModeCopy();
    const visiblePosts = getVisiblePosts();
    const featuredPost = $("featured-post");
    const postList = $("post-list");
    const postView = $("post-view");
    const blogHome = $("blog-home");
    const statusMessage = $("status-message");

    if (blogHome) blogHome.hidden = false;
    if (postView) {
      postView.hidden = true;
      postView.innerHTML = "";
    }
    if (featuredPost) {
      featuredPost.innerHTML = visiblePosts[0] ? postCard(visiblePosts[0], true) : "";
    }
    if (postList) {
      postList.innerHTML = visiblePosts.slice(1).map((post) => postCard(post, false)).join("");
    }
    if (statusMessage) {
      statusMessage.textContent = visiblePosts.length ? "" : copy[currentMode].empty;
    }
  }

  async function renderPost(slug) {
    const post = posts.find((item) => item.slug === slug);
    if (!post || post.mode !== currentMode) {
      window.location.hash = "#/";
      renderHome();
      return;
    }

    const blogHome = $("blog-home");
    const postView = $("post-view");
    const statusMessage = $("status-message");
    if (blogHome) blogHome.hidden = true;
    if (statusMessage) statusMessage.textContent = "";
    if (!postView) return;

    postView.hidden = false;
    postView.innerHTML = '<p class="status">正在加载文章...</p>';

    try {
      const response = await fetch(post.file);
      if (!response.ok) throw new Error("missing post");
      const markdown = await response.text();
      postView.innerHTML = `
        <a class="back-link" href="#/">返回首页</a>
        <article class="article-view">
          <div class="post-meta">${escapeHtml(post.date)} · ${post.tags.map(escapeHtml).join(" / ")}</div>
          ${markdownToHtml(markdown)}
        </article>
      `;
    } catch (_) {
      postView.innerHTML = `
        <a class="back-link" href="#/">返回首页</a>
        <p class="status">这篇文章暂时没有加载成功。</p>
      `;
    }
  }

  function render() {
    const match = window.location.hash.match(/^#\/post\/([^/]+)$/);
    if (match) {
      renderPost(decodeURIComponent(match[1]));
      return;
    }
    renderHome();
  }

  function setMode(mode) {
    if (mode !== "tech" && mode !== "daily") return;
    currentMode = mode;
    render();
  }

  async function loadPosts() {
    const response = await fetch("content/posts.json");
    if (!response.ok) throw new Error("posts index missing");
    posts = await response.json();
  }

  async function init() {
    const nickname = $("nickname-trigger");
    if (nickname) {
      nickname.addEventListener("click", () => {
        nicknameClicks += 1;
        if (nicknameClicks >= DAILY_TRIGGER_COUNT && currentMode !== "daily") {
          setMode("daily");
        }
      });
    }

    window.addEventListener("hashchange", render);

    try {
      await loadPosts();
      render();
    } catch (_) {
      syncModeCopy();
      const statusMessage = $("status-message");
      if (statusMessage) statusMessage.textContent = "文章索引暂时没有加载成功。";
    }
  }

  window.FeatherBlog = {
    get mode() {
      return currentMode;
    },
    setMode,
    render,
  };

  document.addEventListener("DOMContentLoaded", init);
})();
