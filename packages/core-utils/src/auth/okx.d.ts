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
export declare function signOkx(input: OkxSignInput): string;
export declare function buildOkxHeaders(params: {
    credentials: OkxCredentials;
    timestamp: string;
    method: string;
    requestPath: string;
    body?: string;
}): Record<string, string>;
