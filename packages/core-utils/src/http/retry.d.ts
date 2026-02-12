import type { HttpClient } from "./types";
export type RetryOptions = {
    maxAttempts: number;
    retryDelayMs: number;
    retryOnStatuses?: number[];
};
export declare function createRetryingClient(client: HttpClient, options: RetryOptions): HttpClient;
