export class HttpError extends Error {
  status: number;
  body?: string;
  headers?: Record<string, string>;

  constructor(message: string, options: { status: number; body?: string; headers?: Record<string, string> }) {
    super(message);
    this.name = "HttpError";
    this.status = options.status;
    this.body = options.body;
    this.headers = options.headers;
  }
}
