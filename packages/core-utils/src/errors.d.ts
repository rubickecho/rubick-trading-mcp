export declare class HttpError extends Error {
    status: number;
    body?: string;
    headers?: Record<string, string>;
    constructor(message: string, options: {
        status: number;
        body?: string;
        headers?: Record<string, string>;
    });
}
