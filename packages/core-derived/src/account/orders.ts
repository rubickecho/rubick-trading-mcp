import type { NormalizedHistoryOrders, NormalizedPendingOrders } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";
import { safeDiv, mean } from "../utils/stats";

export type OkxOrdersDerivedFeatures = {
  order_count: number;
  buy_sell_ratio: number | null;
  avg_order_size: number | null;
  fill_ratio_avg: number | null;
};

type OrdersInput = NormalizedPendingOrders | NormalizedHistoryOrders;

export function deriveOkxOrders(
  normalized: OrdersInput,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxOrdersDerivedFeatures> {
  const orders = normalized.orders;
  const orderCount = orders.length;
  const buyCount = orders.filter((order) => order.side === "buy").length;
  const sellCount = orders.filter((order) => order.side === "sell").length;

  const sizes = orders.map((order) => order.size);
  const avgOrderSize = mean(sizes);

  const fillRatios = orders
    .map((order) => {
      if (order.filled === undefined) {
        return null;
      }
      return safeDiv(order.filled, order.size);
    })
    .filter((value): value is number => value !== null);

  const fillRatioAvg = mean(fillRatios);
  const buySellRatio = sellCount > 0 ? buyCount / sellCount : null;

  const features: OkxOrdersDerivedFeatures = {
    order_count: orderCount,
    buy_sell_ratio: buySellRatio,
    avg_order_size: avgOrderSize,
    fill_ratio_avg: fillRatioAvg
  };

  return createDerivedEnvelope(level, features);
}
