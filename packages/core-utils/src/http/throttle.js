"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createThrottledClient = createThrottledClient;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function createThrottledClient(client, options) {
    let lastTime = 0;
    let queue = Promise.resolve();
    return {
        async request(req) {
            const run = async () => {
                const now = Date.now();
                const wait = Math.max(0, options.minTimeMs - (now - lastTime));
                if (wait > 0) {
                    await sleep(wait);
                }
                lastTime = Date.now();
                return client.request(req);
            };
            const result = queue.then(run, run);
            queue = result.then(() => undefined, () => undefined);
            return result;
        }
    };
}
