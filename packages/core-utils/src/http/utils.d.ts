import type { HttpRequest } from "./types";
export declare function buildUrl(baseUrl: string | undefined, url: string, query?: HttpRequest["query"]): string;
