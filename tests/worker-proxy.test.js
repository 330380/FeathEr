const fs = require("fs");
const assert = require("assert");

const workerPath = "workers/proxy.js";
assert(fs.existsSync(workerPath), "workers/proxy.js is missing");

const source = fs.readFileSync(workerPath, "utf8");

function includes(text, message) {
  assert(source.includes(text), message);
}

includes("ALLOWED_ORIGIN", "Allowed origin setting is missing");
includes("https://330380.github.io", "GitHub Pages origin is not allowed");
includes("ALLOWED_HOSTS", "Target host whitelist is missing");
includes("api.github.com", "api.github.com sample host is missing");
includes("jsonplaceholder.typicode.com", "jsonplaceholder sample host is missing");
includes("OPTIONS", "CORS preflight handling is missing");
includes("isPrivateHost", "Private host guard is missing");
includes("403", "Forbidden responses are missing");
includes("fetch(targetUrl", "Target fetch is missing");

console.log("worker proxy checks passed");
