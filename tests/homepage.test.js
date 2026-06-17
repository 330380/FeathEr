const fs = require("fs");
const assert = require("assert");

const home = fs.readFileSync("index.html", "utf8");

assert(home.includes("FeathEr"), "homepage brand is missing");
assert(home.includes("接口测试"), "homepage API test button text is missing");
assert(home.includes('href="tester.html"'), "homepage must link to tester.html");
assert(home.includes("轻量性能测试"), "homepage performance test button text is missing");
assert(home.includes('href="performance.html"'), "homepage must link to performance.html");
assert(!home.includes('id="request-url"'), "homepage should not contain the API tester form");

console.log("homepage checks passed");
