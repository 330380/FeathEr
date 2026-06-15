# Cloudflare Worker Proxy

This folder contains a whitelist API proxy for the public API Tester page.

## What It Does

- Allows requests only from `https://330380.github.io`.
- Accepts proxy calls through `POST`.
- Forwards requests only to hosts listed in `ALLOWED_HOSTS`.
- Blocks local/private targets such as `localhost`, `127.0.0.1`, `10.x.x.x`, and `192.168.x.x`.
- Handles browser CORS preflight requests.

## Deploy

1. Open Cloudflare Dashboard.
2. Go to Workers & Pages.
3. Create a Worker.
4. Paste the contents of `workers/proxy.js`.
5. Deploy the Worker.
6. Copy the Worker URL, for example:

```text
https://your-worker-name.your-account.workers.dev/
```

7. Open the API Tester page and enable proxy mode.
8. Paste the Worker URL into the proxy URL field.

## Add Your Interface Domains

Edit `ALLOWED_HOSTS` in `workers/proxy.js`:

```js
const ALLOWED_HOSTS = new Set([
  "api.github.com",
  "jsonplaceholder.typicode.com",
  "api.your-domain.com",
]);
```

Deploy again after changing the whitelist.
