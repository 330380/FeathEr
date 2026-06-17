const fs = require("fs");
const assert = require("assert");

assert(fs.existsSync("performance.html"), "performance.html is missing");
const html = fs.readFileSync("performance.html", "utf8");

function includes(text, message) {
  assert(html.includes(text), message);
}

includes("轻量性能测试", "page title is missing");
includes("https://unpkg.com/vue@3", "Vue 3 CDN script is missing");
includes("Vue.createApp", "Vue app initialization is missing");
includes('id="perf-url"', "URL input is missing");
includes('id="perf-method"', "method selector is missing");
includes('id="perf-headers"', "headers editor is missing");
includes('id="perf-body"', "body editor is missing");
includes('id="request-count"', "request count input is missing");
includes('id="concurrency"', "concurrency input is missing");
includes('id="use-proxy"', "proxy checkbox is missing");
includes('id="proxy-url"', "proxy URL input is missing");
includes('id="start-test"', "start button is missing");
includes('id="stop-test"', "stop button is missing");
includes("平均耗时", "average duration metric is missing");
includes("P95", "P95 metric is missing");
includes("QPS", "QPS metric is missing");
includes("runPerformanceTest", "performance runner is missing");
includes("calculateStats", "stats calculator is missing");

console.log("performance page checks passed");
