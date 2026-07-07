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

  const dailyPortals = [
    { title: "每日签到", detail: "记录今天是否出现，以及一个最小行动。" },
    { title: "每日复盘", detail: "写下今天的收获、消耗和下一步。" },
    { title: "技能树", detail: "把正在练习的能力拆成可见节点。" },
    { title: "任务表", detail: "收纳当前阶段的小任务和推进状态。" },
    { title: "资产管理", detail: "预留给收入、支出和资源盘点。" },
    { title: "愿望清单", detail: "先放想做的事，等合适的时候领取。" },
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

  function renderDailyDashboard(visiblePosts) {
    const attributes = dailyAttributes
      .map(
        (item) => `
          <div class="attribute-card">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.name)}</span>
            </div>
            <div class="attribute-value">${item.value}</div>
            <div class="stat-bar" aria-hidden="true">
              <span style="width: ${item.value}%"></span>
            </div>
          </div>
        `
      )
      .join("");

    const portals = dailyPortals
      .map(
        (item) => `
          <article class="quest-card">
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.detail)}</p>
          </article>
        `
      )
      .join("");

    const latestLog = visiblePosts[0]
      ? `
        <a class="latest-log" href="#/post/${encodeURIComponent(visiblePosts[0].slug)}">
          <span>最新冒险日志</span>
          <strong>${escapeHtml(visiblePosts[0].title)}</strong>
          <small>${escapeHtml(visiblePosts[0].summary)}</small>
        </a>
      `
      : '<p class="status">冒险日志模板还在整理中。</p>';

    return `
      <section class="adventure-dashboard" aria-label="人生冒险日记">
        <div class="adventure-top">
          <div class="adventurer-card">
            <div class="avatar-token" aria-hidden="true">F</div>
            <div>
              <p class="adventure-kicker">Adventurer Profile</p>
              <h2>Feather</h2>
              <dl class="profile-stats">
                <div><dt>职业</dt><dd>Developer</dd></div>
                <div><dt>等级</dt><dd>Lv.1</dd></div>
                <div><dt>称号</dt><dd>编程游侠</dd></div>
                <div><dt>状态</dt><dd>Normal</dd></div>
              </dl>
            </div>
          </div>
          <div class="adventure-panel">
            <p class="adventure-kicker">System Message</p>
            <h2>欢迎来到你的人生游戏系统</h2>
            <p>这里不会发布模板里的真实记录，只保留仪表盘结构。你之后可以把签到、复盘、任务和愿望逐步替换成自己的内容。</p>
            ${latestLog}
          </div>
        </div>

        <div class="attribute-grid">
          ${attributes}
        </div>

        <div class="quest-grid">
          ${portals}
        </div>
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
        currentMode === "daily" ? renderDailyDashboard(visiblePosts) : visiblePosts[0] ? postCard(visiblePosts[0], true) : "";
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
