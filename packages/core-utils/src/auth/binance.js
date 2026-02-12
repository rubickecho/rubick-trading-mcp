"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signBinance = signBinance;
exports.buildBinanceHeaders = buildBinanceHeaders;
const crypto_1 = __importDefault(require("crypto"));
function signBinance(queryString, apiSecret) {
    return crypto_1.default.createHmac("sha256", apiSecret).update(queryString).digest("hex");
}
function buildBinanceHeaders(credentials) {
    return {
        "X-MBX-APIKEY": credentials.apiKey
    };
}
