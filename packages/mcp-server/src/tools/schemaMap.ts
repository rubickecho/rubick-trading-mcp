import {
  balanceOutputSchema,
  positionsOutputSchema,
  ordersOutputSchema,
  tickerOutputSchema,
  candlesOutputSchema,
  orderBookOutputSchema,
  fundingRateOutputSchema,
  openInterestOutputSchema
} from "../schemas";

export const OUTPUT_SCHEMA_MAP = {
  get_balance: balanceOutputSchema,
  get_positions: positionsOutputSchema,
  get_pending_orders: ordersOutputSchema,
  get_history_orders: ordersOutputSchema,
  get_ticker: tickerOutputSchema,
  get_candles: candlesOutputSchema,
  get_order_book: orderBookOutputSchema,
  get_funding_rate: fundingRateOutputSchema,
  get_open_interest: openInterestOutputSchema
} as const;
