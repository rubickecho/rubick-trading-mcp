import type { OkxCandles } from "@rubick-trading-mcp/core-schema";
import { createDerivedEnvelope, type DerivedEnvelope, type DerivedLevel } from "../types";
import { mean, pctChange, stddev, zscore } from "../utils/stats";
import { bollingerLatest, emaLatest, macdLatest, rsiLatest } from "../utils/indicators";

export type OkxCandlesDerivedFeatures = {
  returns_pct: number[];
  volatility_std: number | null;
  atr: number | null;
  ema_fast: number | null;
  ema_slow: number | null;
  ema_diff: number | null;
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  bb_upper: number | null;
  bb_middle: number | null;
  bb_lower: number | null;
  bb_width: number | null;
  trend_state_raw: "up" | "down" | "sideways" | "undefined";
  volume_zscore: number | null;
};

function calculateAtr(candlesAsc: Array<{ high: number; low: number; close: number }>, period: number): number | null {
  if (candlesAsc.length < period + 1) {
    return null;
  }
  const trs: number[] = [];
  for (let i = 1; i < candlesAsc.length; i += 1) {
    const current = candlesAsc[i];
    const prev = candlesAsc[i - 1];
    const range1 = current.high - current.low;
    const range2 = Math.abs(current.high - prev.close);
    const range3 = Math.abs(current.low - prev.close);
    trs.push(Math.max(range1, range2, range3));
  }
  const tail = trs.slice(-period);
  const avg = mean(tail);
  return avg === null ? null : avg;
}

export function deriveOkxCandles(
  normalized: OkxCandles,
  level: DerivedLevel = "basic"
): DerivedEnvelope<OkxCandlesDerivedFeatures> {
  const candles = normalized.candles;
  const returnsPct = candles.map((candle) => {
    const change = pctChange(candle.close, candle.open);
    return change === null ? 0 : change * 100;
  });

  const volatilityStd = stddev(returnsPct);

  const candlesAsc = [...candles].reverse();
  const closeAsc = candlesAsc.map((candle) => candle.close);
  const volumes = candles.map((candle) => candle.volume);

  const emaFast = emaLatest(closeAsc, 20);
  const emaSlow = emaLatest(closeAsc, 50);
  const emaDiff = emaFast !== null && emaSlow !== null ? emaFast - emaSlow : null;

  const rsi = rsiLatest(closeAsc, 14);
  const macd = macdLatest(closeAsc, 12, 26, 9);
  const bb = bollingerLatest(closeAsc, 20, 2);

  let trendState: OkxCandlesDerivedFeatures["trend_state_raw"] = "undefined";
  if (emaFast !== null && emaSlow !== null) {
    if (emaFast > emaSlow) {
      trendState = "up";
    } else if (emaFast < emaSlow) {
      trendState = "down";
    } else {
      trendState = "sideways";
    }
  }

  const latestVolume = volumes[0] ?? 0;
  const volumeZ = zscore(latestVolume, volumes);

  const atr = calculateAtr(
    candlesAsc.map((candle) => ({ high: candle.high, low: candle.low, close: candle.close })),
    14
  );

  const features: OkxCandlesDerivedFeatures = {
    returns_pct: returnsPct,
    volatility_std: volatilityStd,
    atr,
    ema_fast: emaFast,
    ema_slow: emaSlow,
    ema_diff: emaDiff,
    rsi,
    macd: macd.macd,
    macd_signal: macd.signal,
    macd_hist: macd.hist,
    bb_upper: bb.upper,
    bb_middle: bb.middle,
    bb_lower: bb.lower,
    bb_width: bb.width,
    trend_state_raw: trendState,
    volume_zscore: volumeZ
  };

  return createDerivedEnvelope(level, features);
}
