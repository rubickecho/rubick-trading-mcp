"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFetchClient = createFetchClient;
const utils_1 = require("./utils");
function createFetchClient(options = {}) {
    const baseUrl = options.baseUrl;
    const defaultHeaders = options.defaultHeaders ?? {};
    const defaultTimeout = options.timeoutMs;
    return {
        async request(req) {
            const url = (0, utils_1.buildUrl)(baseUrl, req.url, req.query);
            const headers = {
                ...defaultHeaders,
                ...(req.headers ?? {})
            };
            let body;
            if (req.body !== undefined && req.body !== null) {
                if (typeof req.body === "string") {
                    body = req.body;
                }
                else {
                    body = JSON.stringify(req.body);
                    if (!headers["Content-Type"]) {
                        headers["Content-Type"] = "application/json";
                    }
                }
            }
            const controller = new AbortController();
            const timeoutMs = req.timeoutMs ?? defaultTimeout;
            const timeoutId = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
            try {
                const fetchOptions = {
                    method: req.method,
                    headers,
                    body,
                    signal: controller.signal
                };
                const response = await fetch(url, fetchOptions);
                const rawBody = await response.text();
                let data;
                try {
                    data = rawBody ? JSON.parse(rawBody) : undefined;
                }
                catch {
                    data = rawBody;
                }
                const headerEntries = Object.fromEntries(response.headers.entries());
                return {
                    status: response.status,
                    headers: headerEntries,
                    data,
                    rawBody
                };
            }
            finally {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        }
    };
}
