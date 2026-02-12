import type { HttpClient } from "./types";
export type ThrottleOptions = {
    minTimeMs: number;
};
export declare function createThrottledClient(client: HttpClient, options: ThrottleOptions): HttpClient;
