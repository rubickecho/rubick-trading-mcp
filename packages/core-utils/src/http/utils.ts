import type { HttpRequest } from "./types";

export function buildUrl(baseUrl: string | undefined, url: string, query?: HttpRequest["query"]): string {
  const base = baseUrl ? baseUrl.replace(/\/$/, "") : "";
  const path = url.startsWith("http") ? url : `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  if (!query) {
    return path;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    params.append(key, String(value));
  }
  const qs = params.toString();
  if (!qs) {
    return path;
  }
  return `${path}${path.includes("?") ? "&" : "?"}${qs}`;
}
