# Feather Personal Blog Design

## Goal

Convert FeathEr from a small tool landing page into Feather's personal blog. The public default experience is a technical blog. A hidden, temporary interaction switches the same page into a daily-life mode.

## Decisions

- Blog owner nickname: `Feather`.
- Default mode: technical blog.
- Hidden daily mode trigger: click the visible nickname `Feather` five times in the current page session.
- Daily mode persistence: none. Refreshing the page returns to technical mode.
- Content source: lightweight Markdown files plus a small JSON index.
- Existing tools remain available through a tools entry instead of being removed.
- Existing dark/light theme toggle remains available.

## User Experience

The home page becomes the main blog surface. It should show:

- A header with the nickname `Feather`, navigation, and the existing theme toggle.
- A short template introduction for the current mode.
- A featured/latest article area.
- A list of posts filtered by the current mode.
- A tools area linking to `tester.html` and `performance.html`.
- Template contact or profile links that can be replaced later.

Technical mode uses clear technical-blog language and shows technical posts by default. Daily mode uses softer daily-life language and shows daily posts. The mode switch should feel like an Easter egg, not a visible primary control.

## Hidden Mode Behavior

The nickname element is clickable. The page tracks nickname clicks in memory:

1. Start in `tech` mode.
2. Increment an in-memory counter whenever the nickname is clicked.
3. On the fifth click, switch the page state to `daily`.
4. Update page copy, post list, active labels, and any mode-specific empty states.
5. Do not write this mode to `localStorage`, URL parameters, cookies, or any other persistent location.
6. A browser refresh resets the page to `tech` mode.

Dark/light theme preference remains independent and may continue to use `localStorage`.

## Content Model

Create a content index such as `content/posts.json`:

```json
[
  {
    "slug": "first-technical-note",
    "mode": "tech",
    "title": "第一篇技术笔记",
    "date": "2026-07-07",
    "tags": ["模板", "技术"],
    "summary": "这里放技术文章摘要模板。",
    "file": "content/posts/first-technical-note.md"
  }
]
```

Each Markdown post contains simple readable Markdown. The first implementation can support headings, paragraphs, lists, code blocks, links, and inline code. It does not need a full static-site generator.

Initial template posts:

- Tech: `第一篇技术笔记`, `一个项目复盘`, `学习记录模板`
- Daily: `今天的碎片`, `一次散步记录`, `想法备忘录`

## Architecture

Keep the site static and GitHub Pages friendly:

- `index.html` hosts the blog shell and client-side rendering.
- `content/posts.json` stores post metadata.
- `content/posts/*.md` stores article bodies.
- `assets/blog.js` handles loading content, filtering by mode, rendering lists, rendering article details, and hidden-mode switching.
- `assets/styles.css` can hold shared blog styling if the implementation outgrows inline CSS.

For the first version, routing can use hash URLs:

- `#/` for the blog home.
- `#/post/<slug>` for an article.

Hash routing avoids GitHub Pages 404 problems and keeps deployment simple.

## Data Flow

On page load:

1. Apply saved dark/light theme preference.
2. Set content mode to `tech`.
3. Fetch `content/posts.json`.
4. Render the home view with posts where `mode === "tech"`.
5. If the hash points to a post, fetch and render that Markdown post.

On hidden trigger:

1. Set content mode to `daily` in memory.
2. Re-render the current view using daily copy and daily posts.
3. If the current post is not available in daily mode, return to the daily home view.

## Error Handling

- If `posts.json` fails to load, show a short friendly empty state.
- If a Markdown file fails to load, show a missing-article message and a link back to the home view.
- If a post slug is unknown, show a not-found state rather than a blank page.
- If JavaScript is disabled, the page should still show static template content and links to tools.

## Testing

Extend the existing Node-based tests to cover:

- Home page contains the blog shell and nickname `Feather`.
- Home page still includes the theme toggle.
- Content index contains both `tech` and `daily` posts.
- Markdown template files referenced by `posts.json` exist.
- Hidden trigger logic is present and uses five nickname clicks.
- Daily mode is not persisted to `localStorage`.
- Existing tool pages remain linked and their current tests continue passing.

Manual browser verification should cover:

- Default load shows technical blog content.
- Five clicks on `Feather` switch to daily content.
- Refresh returns to technical content.
- Dark/light theme still works.
- Tool links still open.

## Out of Scope For First Version

- Comments.
- Search.
- RSS.
- Tags archive pages.
- Admin editor.
- Build tooling.
- Full Markdown extension support.
- Persisting daily mode.

These can be added later after the blog structure is stable.
