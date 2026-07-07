const fs = require("fs");
const assert = require("assert");

const home = fs.readFileSync("index.html", "utf8");

assert(home.includes("FeathEr"), "homepage brand is missing");
assert(home.includes("接口测试"), "homepage API test button text is missing");
assert(home.includes('href="tester.html"'), "homepage must link to tester.html");
assert(home.includes("轻量性能测试"), "homepage performance test button text is missing");
assert(home.includes('href="performance.html"'), "homepage must link to performance.html");
assert(!home.includes('id="request-url"'), "homepage should not contain the API tester form");
assert(home.includes('id="theme-toggle"'), "homepage theme toggle button is missing");
assert(home.includes('data-theme="light"'), "homepage must declare an initial light theme");
assert(home.includes('data-theme="dark"'), "homepage must include dark theme styles");
assert(home.includes("localStorage.getItem(THEME_STORAGE_KEY)"), "theme toggle must restore saved preference");
assert(home.includes("window.matchMedia(\"(prefers-color-scheme: dark)\")"), "theme toggle must detect system dark mode");
assert(home.includes("localStorage.setItem(THEME_STORAGE_KEY, nextTheme)"), "theme toggle must persist the selected theme");

console.log("homepage checks passed");
