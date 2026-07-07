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
      label: "日常模式",
      title: "人生冒险日记",
      description: "把日常当成一场轻量冒险：签到、复盘、技能树和任务表都先用模板占位，之后再慢慢填入真实内容。",
      empty: "日常片段还在路上。",
    },
  };

  const dailyAttributes = [
    { label: "智慧", name: "Wisdom", value: 72 },
    { label: "心情", name: "Mood", value: 68 },
    { label: "体力", name: "Energy", value: 64 },
    { label: "财富", name: "Fortune", value: 36 },
  ];

  const dailyDatabaseLinks = [
    { icon: "✅", title: "每日签到", detail: "Daily check-in" },
    { icon: "📝", title: "每日复盘", detail: "Daily review" },
    { icon: "🌱", title: "技能树", detail: "Skill tree" },
    { icon: "🎯", title: "任务表", detail: "Quest board" },
    { icon: "💰", title: "资产管理", detail: "Assets" },
    { icon: "⭐", title: "愿望清单", detail: "Wishlist" },
    { icon: "📌", title: "负债管理", detail: "Liabilities" },
  ];

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

  function renderDailyDatabaseLink(item) {
    return `
      <a class="notion-page-link" href="#/" aria-label="${escapeHtml(item.title)}">
        <span class="notion-page-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
        <span>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </span>
      </a>
    `;
  }

  function renderDailyExportPage(visiblePosts) {
    const attributes = dailyAttributes
      .map(
        (item) => `
          <div class="notion-property">
            <span>${escapeHtml(item.label)} ${escapeHtml(item.name)}</span>
            <strong>${item.value}</strong>
          </div>
        `
      )
      .join("");

    const logs = visiblePosts.length
      ? visiblePosts
          .map(
            (post) => `
              <a class="notion-log-row" href="#/post/${encodeURIComponent(post.slug)}">
                <span>${escapeHtml(post.date)}</span>
                <strong>${escapeHtml(post.title)}</strong>
                <small>${escapeHtml(post.summary)}</small>
              </a>
            `
          )
          .join("")
      : '<p class="status">冒险日志模板还在整理中。</p>';

    return `
      <section class="notion-export-page" aria-label="人生冒险日记">
        <h1>人生冒险日记</h1>
        <blockquote>
          <strong>欢迎来到你的人生游戏系统</strong>
          <span>在这里，每一个行动都在塑造角色。完成任务，提升属性，成为更强大的自己。</span>
        </blockquote>

        <hr class="notion-divider">

        <div class="notion-aside-grid">
          <aside class="notion-aside">
            <div class="notion-aside-icon" aria-hidden="true">🧑‍💻</div>
            <div class="notion-profile">
              <strong>Feather</strong>
              <em>Developer</em>
              <div class="notion-avatar" aria-hidden="true">F</div>
              <p><b>总等级</b>: Lv.1</p>
              <p><b>称号</b>: 『编码游侠』</p>
            </div>
          </aside>

          <aside class="notion-aside">
            <div class="notion-aside-icon" aria-hidden="true">⚡</div>
            <h2>核心属性</h2>
            <div class="notion-property-list">
              ${attributes}
            </div>
          </aside>

          <aside class="notion-aside">
            <div class="notion-aside-icon" aria-hidden="true">📊</div>
            <h2>统计数据</h2>
            <div class="notion-property-list">
              <div class="notion-property"><span>任务汇总</span><strong>模板</strong></div>
              <div class="notion-property"><span>当前状态</span><strong>正常</strong></div>
            </div>
            <hr class="notion-divider">
            <p class="notion-note">这里只模拟导出页结构，不发布模板里的真实统计。</p>
          </aside>
        </div>

        <hr class="notion-divider">

        <div class="notion-link-stack">
          ${dailyDatabaseLinks.slice(0, 2).map(renderDailyDatabaseLink).join("")}
        </div>

        <hr class="notion-divider">

        <div class="notion-link-stack">
          ${dailyDatabaseLinks.slice(2, 3).map(renderDailyDatabaseLink).join("")}
        </div>

        <hr class="notion-divider">

        <div class="notion-link-stack">
          ${dailyDatabaseLinks.slice(3, 4).map(renderDailyDatabaseLink).join("")}
        </div>

        <hr class="notion-divider">

        <div class="notion-link-stack">
          ${dailyDatabaseLinks.slice(4, 6).map(renderDailyDatabaseLink).join("")}
        </div>

        <hr class="notion-divider">

        <div class="notion-link-stack">
          ${dailyDatabaseLinks.slice(6).map(renderDailyDatabaseLink).join("")}
        </div>

        <hr class="notion-divider">

        <section class="notion-database-preview" aria-label="冒险日志">
          <h2>冒险日志</h2>
          <div class="notion-log-table">
            ${logs}
          </div>
        </section>
      </section>
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
    const sectionHeading = blogHome ? blogHome.querySelector(".section-heading") : null;
    const sectionTitle = sectionHeading ? sectionHeading.querySelector("h2") : null;
    const sectionDescription = sectionHeading ? sectionHeading.querySelector("p") : null;
    if (sectionTitle) {
      sectionTitle.textContent = currentMode === "daily" ? "冒险日志" : "最新文章";
    }
    if (sectionDescription) {
      sectionDescription.textContent =
        currentMode === "daily"
          ? "这里继续使用安全占位文章，不读取也不发布模板导出的真实日记。"
          : "默认展示技术博客。隐藏模式只在当前页面会话中生效。";
    }
    if (featuredPost) {
      featuredPost.innerHTML =
        currentMode === "daily" ? renderDailyExportPage(visiblePosts) : visiblePosts[0] ? postCard(visiblePosts[0], true) : "";
    }
    if (postList) {
      const listedPosts = currentMode === "daily" ? visiblePosts : visiblePosts.slice(1);
      postList.innerHTML = listedPosts.map((post) => postCard(post, false)).join("");
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
