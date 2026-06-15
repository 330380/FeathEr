const https = require("https");
const assert = require("assert");

const pages = [
  {
    url: "https://330380.github.io/FeathEr/",
    expected: ["一个轻量的在线工具集合", "接口测试"],
  },
  {
    url: "https://330380.github.io/FeathEr/tester.html",
    expected: ["输入任意接口 URL", "使用白名单代理服务器"],
  },
];

Promise.all(pages.map(checkPage)).then(() => {
  console.log("public page encoding checks passed");
});

function checkPage(page) {
  return new Promise((resolve, reject) => {
    https
      .get(page.url, { headers: { "Cache-Control": "no-cache" } }, (response) => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", (chunk) => {
      body += chunk;
    });
    response.on("end", () => {
      assert.strictEqual(response.statusCode, 200, `${page.url} must return HTTP 200`);
      for (const text of page.expected) {
        assert(body.includes(text), `${page.url} is missing expected Chinese text: ${text}`);
      }
      assert(!body.includes("杈撳叆"), "public page contains mojibake");
      assert(!body.includes("浣跨敤"), "public page contains mojibake");
      resolve();
    });
  })
  .on("error", (error) => {
    reject(error);
  });
  });
}
