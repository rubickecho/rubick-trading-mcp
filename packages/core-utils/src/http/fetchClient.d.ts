import type { HttpClient } from "./types";
export type FetchClientOptions = {
    baseUrl?: string;
    timeoutMs?: number;
    defaultHeaders?: Record<string, string>;
};
export declare function createFetchClient(options?: FetchClientOptions): HttpClient;
