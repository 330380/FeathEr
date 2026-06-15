const https = require("https");
const assert = require("assert");

const url = "https://330380.github.io/FeathEr/";

https
  .get(url, { headers: { "Cache-Control": "no-cache" } }, (response) => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", (chunk) => {
      body += chunk;
    });
    response.on("end", () => {
      assert.strictEqual(response.statusCode, 200, "public page must return HTTP 200");
      assert(body.includes("输入任意接口 URL"), "public page Chinese subtitle is corrupted");
      assert(body.includes("使用白名单代理服务器"), "public page proxy label is corrupted");
      assert(!body.includes("杈撳叆"), "public page contains mojibake");
      assert(!body.includes("浣跨敤"), "public page contains mojibake");
      console.log("public page encoding checks passed");
    });
  })
  .on("error", (error) => {
    throw error;
  });
