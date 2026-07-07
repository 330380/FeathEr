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
assert(blogScript.includes('currentMode = "tech"'), "blog must default to tech mode");
assert(!blogScript.includes('localStorage.setItem("feather-mode"'), "daily mode must not be persisted");
assert(!blogScript.includes("localStorage.setItem('feather-mode'"), "daily mode must not be persisted");

console.log("blog content checks passed");
