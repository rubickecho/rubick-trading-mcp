"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetryingClient = createRetryingClient;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function createRetryingClient(client, options) {
    const retryOn = options.retryOnStatuses ?? [429, 500, 502, 503, 504];
    return {
        async request(req) {
            let attempt = 0;
            let lastResponse;
            while (attempt < options.maxAttempts) {
                attempt += 1;
                const response = await client.request(req);
                lastResponse = response;
                if (!retryOn.includes(response.status)) {
                    return response;
                }
                if (attempt < options.maxAttempts) {
                    await sleep(options.retryDelayMs);
                }
            }
            return lastResponse;
        }
    };
}
