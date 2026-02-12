export type BinanceCredentials = {
    apiKey: string;
    apiSecret: string;
};
export declare function signBinance(queryString: string, apiSecret: string): string;
export declare function buildBinanceHeaders(credentials: BinanceCredentials): Record<string, string>;
