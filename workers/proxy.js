const ALLOWED_ORIGIN = "https://330380.github.io";
const ALLOWED_HOSTS = new Set([
  "api.github.com",
  "jsonplaceholder.typicode.com",
]);
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);
const MAX_BODY_BYTES = 1024 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Only POST is supported." }, 405);
    }

    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) {
      return jsonResponse({ error: "Origin is not allowed." }, 403);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (_) {
      return jsonResponse({ error: "Request body must be JSON." }, 400);
    }

    const method = String(payload.method || "GET").toUpperCase();
    if (!ALLOWED_METHODS.has(method)) {
      return jsonResponse({ error: "HTTP method is not allowed." }, 405);
    }

    let targetUrl;
    try {
      targetUrl = new URL(payload.url);
    } catch (_) {
      return jsonResponse({ error: "Target URL is invalid." }, 400);
    }

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return jsonResponse({ error: "Only HTTP and HTTPS targets are allowed." }, 400);
    }

    if (!ALLOWED_HOSTS.has(targetUrl.hostname)) {
      return jsonResponse({ error: `Target host is not in whitelist: ${targetUrl.hostname}` }, 403);
    }

    if (isPrivateHost(targetUrl.hostname)) {
      return jsonResponse({ error: "Private or local targets are blocked." }, 403);
    }

    const headers = sanitizeHeaders(payload.headers || {});
    const init = { method, headers };
    const body = typeof payload.body === "string" ? payload.body : "";

    if (!["GET", "HEAD"].includes(method) && body) {
      if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) {
        return jsonResponse({ error: "Request body is too large." }, 413);
      }
      init.body = body;
    }

    const response = await fetch(targetUrl.toString(), init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    responseHeaders.set("Access-Control-Expose-Headers", "*");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};

function sanitizeHeaders(input) {
  const headers = new Headers();
  if (!input || Array.isArray(input) || typeof input !== "object") return headers;

  const blocked = new Set([
    "host",
    "origin",
    "referer",
    "connection",
    "content-length",
    "transfer-encoding",
  ]);

  for (const [key, value] of Object.entries(input)) {
    const lowerKey = key.toLowerCase();
    if (blocked.has(lowerKey)) continue;
    headers.set(key, String(value));
  }

  return headers;
}

function isPrivateHost(hostname) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const parts = host.split(".").map(Number);
    const [a, b] = parts;
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    );
  }

  return false;
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
