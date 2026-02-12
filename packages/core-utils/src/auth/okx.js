"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOkx = signOkx;
exports.buildOkxHeaders = buildOkxHeaders;
const crypto_1 = __importDefault(require("crypto"));
function signOkx(input) {
    const prehash = `${input.timestamp}${input.method.toUpperCase()}${input.requestPath}${input.body ?? ""}`;
    return crypto_1.default.createHmac("sha256", input.apiSecret).update(prehash).digest("base64");
}
function buildOkxHeaders(params) {
    const signature = signOkx({
        timestamp: params.timestamp,
        method: params.method,
        requestPath: params.requestPath,
        body: params.body,
        apiSecret: params.credentials.apiSecret
    });
    return {
        "OK-ACCESS-KEY": params.credentials.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": params.timestamp,
        "OK-ACCESS-PASSPHRASE": params.credentials.passphrase,
        "Content-Type": "application/json"
    };
}
