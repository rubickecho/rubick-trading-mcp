import http from "node:http";
import type { HttpServerOptions } from "./handler";
import { createHttpHandler } from "./handler";

export function createHttpServer(options: HttpServerOptions): http.Server {
  return http.createServer(createHttpHandler(options));
}
