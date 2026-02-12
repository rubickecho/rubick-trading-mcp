import crypto from "crypto";

export type BinanceCredentials = {
  apiKey: string;
  apiSecret: string;
};

export function signBinance(queryString: string, apiSecret: string): string {
  return crypto.createHmac("sha256", apiSecret).update(queryString).digest("hex");
}

export function buildBinanceHeaders(credentials: BinanceCredentials): Record<string, string> {
  return {
    "X-MBX-APIKEY": credentials.apiKey
  };
}
