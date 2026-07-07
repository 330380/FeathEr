# Personal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 FeathEr 首页实现为默认技术博客、隐藏日常模式、Markdown 内容驱动的个人博客。

**Architecture:** 保持 GitHub Pages 友好的纯静态结构。`index.html` 提供博客外壳和无 JavaScript 时的静态内容，`assets/blog.js` 负责加载 `content/posts.json` 和 Markdown，按 `tech` / `daily` 模式渲染列表与详情。

**Tech Stack:** 静态 HTML、CSS、原生 JavaScript、JSON、Markdown、现有 Node `assert` 测试。

## Global Constraints

- 昵称必须使用 `Feather`。
- 默认内容模式必须是 `tech` 技术博客。
- 连续点击昵称 `Feather` 五次后，当前页面会话切换到 `daily` 日常模式。
- 日常模式不能写入 `localStorage`、URL 参数、Cookie 或其他持久化位置。
- 刷新页面后必须恢复技术博客。
- 深色/浅色主题切换继续保留，并可继续使用 `localStorage`。
- 现有 `tester.html` 和 `performance.html` 必须继续可访问。
- 第一版不引入构建工具或外部依赖。

---

## File Structure

- Modify `index.html`: 替换为博客首页外壳，保留主题切换，引用 `assets/styles.css` 和 `assets/blog.js`，提供静态 fallback 内容。
- Create `assets/styles.css`: 博客布局、主题变量、响应式样式、文章详情样式。
- Create `assets/blog.js`: 内容加载、hash 路由、Markdown 渲染、技术/日常模式切换、隐藏点击触发。
- Create `content/posts.json`: 六篇模板文章的元数据索引。
- Create `content/posts/*.md`: 三篇技术模板文章和三篇日常模板文章。
- Modify `tests/homepage.test.js`: 更新首页结构断言，覆盖博客外壳、主题切换、隐藏触发脚本和工具链接。
- Create `tests/blog-content.test.js`: 验证内容索引、模式覆盖、Markdown 文件存在和 daily 模式不持久化。

---

### Task 1: Blog Contract Tests

**Files:**
- Modify: `tests/homepage.test.js`
- Create: `tests/blog-content.test.js`

**Interfaces:**
- Consumes: `index.html`, `assets/blog.js`, `content/posts.json`
- Produces: 行为约束测试，后续实现必须满足这些断言。

- [ ] **Step 1: Write failing homepage test**

Replace `tests/homepage.test.js` with assertions for the new blog shell:

```js
const fs = require("fs");
const assert = require("assert");

const home = fs.readFileSync("index.html", "utf8");

assert(home.includes("Feather"), "homepage nickname is missing");
assert(home.includes('id="nickname-trigger"'), "nickname trigger is missing");
assert(home.includes('id="theme-toggle"'), "homepage theme toggle button is missing");
assert(home.includes('data-theme="light"'), "homepage must declare an initial light theme");
assert(home.includes('data-theme="dark"'), "homepage must include dark theme styles");
assert(home.includes('href="tester.html"'), "homepage must link to tester.html");
assert(home.includes('href="performance.html"'), "homepage must link to performance.html");
assert(home.includes('src="assets/blog.js"'), "homepage must load blog renderer");
assert(home.includes('href="assets/styles.css"'), "homepage must load blog styles");
assert(home.includes("技术博客"), "homepage fallback must mention technical blog");
assert(home.includes("API Tester"), "homepage fallback must keep tool entry");
assert(!home.includes('id="request-url"'), "homepage should not contain the API tester form");

console.log("homepage checks passed");
```

- [ ] **Step 2: Write failing content test**

Create `tests/blog-content.test.js`:

```js
const fs = require("fs");
const path = require("path");
const assert = require("assert");

assert(fs.existsSync("assets/blog.js"), "blog renderer is missing");
assert(fs.existsSync("content/posts.json"), "posts index is missing");

const posts = JSON.parse(fs.readFileSync("content/posts.json", "utf8"));

assert.strictEqual(posts.length, 6, "posts index must start with six template posts");
assert(posts.some((post) => post.mode === "tech"), "posts index must include tech posts");
assert(posts.some((post) => post.mode === "daily"), "posts index must include daily posts");

for (const post of posts) {
  assert(post.slug, "post slug is required");
  assert(["tech", "daily"].includes(post.mode), `invalid post mode for ${post.slug}`);
  assert(post.title, `post title is required for ${post.slug}`);
  assert(post.date, `post date is required for ${post.slug}`);
  assert(Array.isArray(post.tags), `post tags must be an array for ${post.slug}`);
  assert(post.summary, `post summary is required for ${post.slug}`);
  assert(post.file, `post file is required for ${post.slug}`);
  assert(fs.existsSync(path.join(process.cwd(), post.file)), `${post.file} is missing`);
}

const blogScript = fs.readFileSync("assets/blog.js", "utf8");
assert(blogScript.includes("DAILY_TRIGGER_COUNT = 5"), "daily mode must trigger after five nickname clicks");
assert(blogScript.includes("currentMode = \"tech\""), "blog must default to tech mode");
assert(!blogScript.includes("localStorage.setItem(\"feather-mode\""), "daily mode must not be persisted");
assert(!blogScript.includes("localStorage.setItem('feather-mode'"), "daily mode must not be persisted");

console.log("blog content checks passed");
```

- [ ] **Step 3: Run tests and verify RED**

Run:

```powershell
node tests\homepage.test.js; node tests\blog-content.test.js
```

Expected: fail because `nickname-trigger`, `assets/blog.js`, `content/posts.json`, and Markdown files do not exist yet.

- [ ] **Step 4: Commit tests**

```powershell
git add tests\homepage.test.js tests\blog-content.test.js
git commit -m "Add blog contract tests"
```

---

### Task 2: Content Data

**Files:**
- Create: `content/posts.json`
- Create: `content/posts/first-technical-note.md`
- Create: `content/posts/project-review-template.md`
- Create: `content/posts/learning-log-template.md`
- Create: `content/posts/today-fragments.md`
- Create: `content/posts/walk-note.md`
- Create: `content/posts/thought-memo.md`

**Interfaces:**
- Consumes: test contract from Task 1.
- Produces: `content/posts.json` array with `{ slug, mode, title, date, tags, summary, file }`; Markdown bodies used by `assets/blog.js`.

- [ ] **Step 1: Create content index and Markdown files**

Create six posts matching the spec:

```json
[
  {
    "slug": "first-technical-note",
    "mode": "tech",
    "title": "第一篇技术笔记",
    "date": "2026-07-07",
    "tags": ["模板", "技术"],
    "summary": "记录一个技术问题、解决思路和最终结论。",
    "file": "content/posts/first-technical-note.md"
  }
]
```

Each Markdown file should include at least one heading, paragraph, list, and code or inline-code example where natural.

- [ ] **Step 2: Run content test**

Run:

```powershell
node tests\blog-content.test.js
```

Expected: still fail because `assets/blog.js` has not been implemented.

---

### Task 3: Blog Renderer

**Files:**
- Create: `assets/blog.js`

**Interfaces:**
- Consumes: `content/posts.json`, Markdown files, DOM ids from Task 4.
- Produces: `window.FeatherBlog` with `setMode(mode)`, `render()`, and in-memory `currentMode`; automatic initialization on `DOMContentLoaded`.

- [ ] **Step 1: Implement `assets/blog.js` minimally**

Required constants and state:

```js
const DAILY_TRIGGER_COUNT = 5;
let currentMode = "tech";
let nicknameClicks = 0;
let posts = [];
```

Required behaviors:

- Fetch `content/posts.json`.
- Render home list filtered by `currentMode`.
- Render post detail for `#/post/<slug>`.
- Convert simple Markdown to HTML while escaping unsafe HTML.
- On five clicks of `#nickname-trigger`, set `currentMode = "daily"` and re-render.
- Do not persist `currentMode`.

- [ ] **Step 2: Run content test**

Run:

```powershell
node tests\blog-content.test.js
```

Expected: PASS.

---

### Task 4: Blog Shell And Styles

**Files:**
- Modify: `index.html`
- Create: `assets/styles.css`

**Interfaces:**
- Consumes: renderer requirements from Task 3.
- Produces: DOM ids `nickname-trigger`, `mode-label`, `hero-title`, `hero-description`, `featured-post`, `post-list`, `post-view`, `status-message`; fallback links to tools.

- [ ] **Step 1: Replace homepage shell**

`index.html` must include:

- `<html lang="zh-CN" data-theme="light">`
- `<link rel="stylesheet" href="assets/styles.css">`
- `<button id="theme-toggle" ...>`
- `<button id="nickname-trigger" ...>Feather</button>`
- Tool links to `tester.html` and `performance.html`
- `<script src="assets/blog.js" defer></script>`

- [ ] **Step 2: Add blog CSS**

`assets/styles.css` must define:

- light and dark theme variables;
- fixed top-right theme toggle;
- blog header, nav, hero, post cards, tool links, article detail;
- mobile layout under `720px`.

- [ ] **Step 3: Run homepage test**

Run:

```powershell
node tests\homepage.test.js
```

Expected: PASS.

---

### Task 5: Full Verification

**Files:**
- No new files.

**Interfaces:**
- Consumes: completed blog implementation.
- Produces: verified working static blog.

- [ ] **Step 1: Run all local tests**

Run:

```powershell
node tests\api-tester-page.test.js; node tests\homepage.test.js; node tests\performance-page.test.js; node tests\worker-proxy.test.js; node tests\blog-content.test.js
```

Expected: all checks pass.

- [ ] **Step 2: Browser verify**

Serve the site locally with Node, open `http://127.0.0.1:8000/`, and verify:

- default content is technical;
- clicking `Feather` five times changes to daily content;
- reloading returns to technical content;
- theme toggle still changes theme;
- tool links still exist.

- [ ] **Step 3: Commit implementation**

```powershell
git add index.html assets content tests
git commit -m "Implement personal blog homepage"
```
