const fs = require("fs");
const assert = require("assert");

const home = fs.readFileSync("index.html", "utf8");
const styles = fs.existsSync("assets/styles.css") ? fs.readFileSync("assets/styles.css", "utf8") : "";

assert(home.includes("Feather"), "homepage nickname is missing");
assert(home.includes('id="nickname-trigger"'), "nickname trigger is missing");
assert(home.includes('id="theme-toggle"'), "homepage theme toggle button is missing");
assert(home.includes('data-theme="light"'), "homepage must declare an initial light theme");
assert(styles.includes('data-theme="dark"'), "homepage styles must include dark theme styles");
assert(home.includes('href="tester.html"'), "homepage must link to tester.html");
assert(home.includes('href="performance.html"'), "homepage must link to performance.html");
assert(home.includes('src="assets/blog.js"'), "homepage must load blog renderer");
assert(home.includes('href="assets/styles.css"'), "homepage must load blog styles");
assert(home.includes("技术博客"), "homepage fallback must mention technical blog");
assert(home.includes("API Tester"), "homepage fallback must keep tool entry");
assert(!home.includes('id="request-url"'), "homepage should not contain the API tester form");

console.log("homepage checks passed");
