import {
  accountToolInputSchema,
  marketToolInputSchema,
  balanceOutputSchema,
  positionsOutputSchema,
  ordersOutputSchema,
  tickerOutputSchema,
  candlesOutputSchema,
  orderBookOutputSchema,
  fundingRateOutputSchema,
  openInterestOutputSchema
} from "../schemas";

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: unknown;
  outputSchema: unknown;
};

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    name: "get_balance",
    description: "Get account balances (OKX/Binance USD-M/Hyperliquid)",
    inputSchema: accountToolInputSchema,
    outputSchema: balanceOutputSchema
  },
  {
    name: "get_positions",
    description: "Get open positions (OKX/Binance USD-M/Hyperliquid)",
    inputSchema: accountToolInputSchema,
    outputSchema: positionsOutputSchema
  },
  {
    name: "get_pending_orders",
    description: "Get open orders (OKX/Binance USD-M/Hyperliquid)",
    inputSchema: accountToolInputSchema,
    outputSchema: ordersOutputSchema
  },
  {
    name: "get_history_orders",
    description: "Get historical orders/fills (OKX/Binance USD-M/Hyperliquid)",
    inputSchema: accountToolInputSchema,
    outputSchema: ordersOutputSchema
  },
  {
    name: "get_ticker",
    description: "Get OKX ticker data",
    inputSchema: marketToolInputSchema,
    outputSchema: tickerOutputSchema
  },
  {
    name: "get_candles",
    description: "Get OKX candles",
    inputSchema: marketToolInputSchema,
    outputSchema: candlesOutputSchema
  },
  {
    name: "get_order_book",
    description: "Get OKX order book",
    inputSchema: marketToolInputSchema,
    outputSchema: orderBookOutputSchema
  },
  {
    name: "get_funding_rate",
    description: "Get OKX funding rate",
    inputSchema: marketToolInputSchema,
    outputSchema: fundingRateOutputSchema
  },
  {
    name: "get_open_interest",
    description: "Get OKX open interest",
    inputSchema: marketToolInputSchema,
    outputSchema: openInterestOutputSchema
  }
];
