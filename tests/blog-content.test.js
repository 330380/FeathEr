const fs = require("fs");
const path = require("path");
const assert = require("assert");

assert(fs.existsSync("assets/blog.js"), "blog renderer is missing");
assert(fs.existsSync("assets/styles.css"), "site stylesheet is missing");
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
const styles = fs.readFileSync("assets/styles.css", "utf8");
assert(blogScript.includes("DAILY_TRIGGER_COUNT = 5"), "daily mode must trigger after five nickname clicks");
assert(blogScript.includes('currentMode = "tech"'), "blog must default to tech mode");
assert(!blogScript.includes('localStorage.setItem("feather-mode"'), "daily mode must not be persisted");
assert(!blogScript.includes("localStorage.setItem('feather-mode'"), "daily mode must not be persisted");
assert(blogScript.includes("renderDailyExportPage"), "daily mode must render the Notion-style exported page");
assert(blogScript.includes("renderDailyDatabaseLink"), "daily database links must render from array items safely");
assert(blogScript.includes("notion-export-page"), "daily mode must use the exported page wrapper");
assert(blogScript.includes("notion-aside"), "daily mode must use Notion-style aside blocks");
assert(blogScript.includes("notion-page-link"), "daily mode must use Notion-style database links");
assert(blogScript.includes("人生冒险日记"), "daily mode must use the adventure diary structure");
assert(blogScript.includes("每日签到"), "daily mode must include the daily check-in portal");
assert(blogScript.includes("每日复盘"), "daily mode must include the daily review portal");
assert(blogScript.includes("技能树"), "daily mode must include the skill tree portal");
assert(blogScript.includes("任务表"), "daily mode must include the quest board portal");
assert(blogScript.includes("资产管理"), "daily mode must include the asset management portal");
assert(blogScript.includes("愿望清单"), "daily mode must include the wishlist portal");
assert(!blogScript.includes("moban"), "published script must not reference the local template folder");
assert(!blogScript.includes("MyMaoXian"), "published script must not reference the source template name");
assert(!blogScript.includes(".csv"), "published script must not reference exported CSV data");
assert(!blogScript.includes("Little Perilla"), "published script must not include real template profile data");
assert(!blogScript.includes("小紫苏"), "published script must not include real template profile data");
assert(!blogScript.includes("adventure-dashboard"), "daily mode must not use the previous dashboard structure");
assert(styles.includes(".notion-export-page"), "daily mode stylesheet must include the exported page layout");
assert(styles.includes(".notion-aside"), "daily mode stylesheet must include Notion-style aside blocks");
assert(styles.includes(".notion-page-link"), "daily mode stylesheet must include Notion-style page links");
assert(!styles.includes(".adventure-dashboard"), "daily mode stylesheet must not keep the previous dashboard layout");
assert(!styles.includes(".quest-grid"), "daily mode stylesheet must not keep the previous quest grid");

console.log("blog content checks passed");
