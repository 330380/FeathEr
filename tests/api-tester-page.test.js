const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("index.html", "utf8");

function includes(text, message) {
  assert(html.includes(text), message);
}

includes('id="request-url"', "URL input is missing");
includes('id="request-method"', "Method selector is missing");
includes('id="request-headers"', "Headers editor is missing");
includes('id="request-body"', "Body editor is missing");
includes('id="send-request"', "Send button is missing");
includes('id="response-status"', "Response status output is missing");
includes('id="response-time"', "Response time output is missing");
includes('id="response-body"', "Response body output is missing");
includes("CORS", "CORS guidance is missing");
includes("https://unpkg.com/vue@3", "Vue 3 CDN script is missing");
includes('id="app"', "Vue app mount point is missing");
includes("Vue.createApp", "Vue app initialization is missing");
includes("async sendRequest()", "sendRequest handler is missing");
includes("performance.now", "Request timing is missing");
includes("JSON.stringify", "JSON formatting is missing");

console.log("api tester page checks passed");
