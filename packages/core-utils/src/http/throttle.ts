import type { HttpClient, HttpRequest, HttpResponse } from "./types";

export type ThrottleOptions = {
  minTimeMs: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createThrottledClient(client: HttpClient, options: ThrottleOptions): HttpClient {
  let lastTime = 0;
  let queue: Promise<void> = Promise.resolve();

  return {
    async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
      const run = async (): Promise<HttpResponse<T>> => {
        const now = Date.now();
        const wait = Math.max(0, options.minTimeMs - (now - lastTime));
        if (wait > 0) {
          await sleep(wait);
        }
        lastTime = Date.now();
        return client.request<T>(req);
      };

      const result = queue.then(run, run);
      queue = result.then(
        () => undefined,
        () => undefined
      );
      return result;
    }
  };
}
