export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type HttpRequest = {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: string | Record<string, unknown> | null;
    timeoutMs?: number;
};
export type HttpResponse<T = unknown> = {
    status: number;
    headers: Record<string, string>;
    data: T;
    rawBody: string;
};
export interface HttpClient {
    request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>>;
}
