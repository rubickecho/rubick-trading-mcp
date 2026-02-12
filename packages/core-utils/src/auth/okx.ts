import crypto from "crypto";

export type OkxCredentials = {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
};

export type OkxSignInput = {
  timestamp: string;
  method: string;
  requestPath: string;
  body?: string;
  apiSecret: string;
};

export function signOkx(input: OkxSignInput): string {
  const prehash = `${input.timestamp}${input.method.toUpperCase()}${input.requestPath}${input.body ?? ""}`;
  return crypto.createHmac("sha256", input.apiSecret).update(prehash).digest("base64");
}

export function buildOkxHeaders(params: {
  credentials: OkxCredentials;
  timestamp: string;
  method: string;
  requestPath: string;
  body?: string;
}): Record<string, string> {
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
