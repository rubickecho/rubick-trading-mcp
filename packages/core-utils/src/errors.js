"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, options) {
        super(message);
        this.name = "HttpError";
        this.status = options.status;
        this.body = options.body;
        this.headers = options.headers;
    }
}
exports.HttpError = HttpError;
