export const onRequest: PagesFunction = async (context) => {
  const { request, params, env } = context;
  const url = new URL(request.url);
  const pathParam = params?.path;
  const path = Array.isArray(pathParam) ? pathParam.join("/") : (pathParam || "");

  // Base origin of the Worker API; set this in Pages project env
  // e.g. https://public-worker.shirasame-official.workers.dev
  const apiBase = (env as any).API_BASE_ORIGIN || "https://public-worker.shirasame-official.workers.dev";
  const targetUrl = `${apiBase.replace(/\/$/, "")}/api/${path}${url.search}`;

  const method = request.method;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  let body: BodyInit | undefined = undefined;
  if (!(method === "GET" || method === "HEAD")) {
    // Clone body safely
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await request.json().catch(() => undefined);
      body = json ? JSON.stringify(json) : undefined;
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const blob = await request.blob();
      body = blob;
    } else {
      const arrayBuf = await request.arrayBuffer();
      body = arrayBuf;
    }
  }

  const resp = await fetch(targetUrl, { method, headers, body, redirect: "manual" });

  // Pass-through response (status, headers, body)
  const outHeaders = new Headers(resp.headers);
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: outHeaders });
};
