import { mean, stddev } from "./stats";

export function emaSeries(values: number[], period: number): Array<number | null> {
  const result: Array<number | null> = new Array(values.length).fill(null);
  if (values.length < period || period <= 0) {
    return result;
  }

  const slice = values.slice(0, period);
  const initial = mean(slice);
  if (initial === null) {
    return result;
  }
  const multiplier = 2 / (period + 1);
  let prevEma = initial;
  result[period - 1] = prevEma;

  for (let i = period; i < values.length; i += 1) {
    prevEma = values[i] * multiplier + prevEma * (1 - multiplier);
    result[i] = prevEma;
  }

  return result;
}

export function emaLatest(values: number[], period: number): number | null {
  const series = emaSeries(values, period);
  for (let i = series.length - 1; i >= 0; i -= 1) {
    const value = series[i];
    if (value !== null) {
      return value;
    }
  }
  return null;
}

export function rsiLatest(values: number[], period: number): number | null {
  if (values.length <= period || period <= 0) {
    return null;
  }

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function macdLatest(
  values: number[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number
): { macd: number | null; signal: number | null; hist: number | null } {
  if (values.length < slowPeriod + signalPeriod) {
    return { macd: null, signal: null, hist: null };
  }

  const fast = emaSeries(values, fastPeriod);
  const slow = emaSeries(values, slowPeriod);
  const macdSeries: Array<number | null> = values.map((_, index) => {
    const fastValue = fast[index];
    const slowValue = slow[index];
    if (fastValue === null || slowValue === null) {
      return null;
    }
    return fastValue - slowValue;
  });

  const firstMacdIndex = macdSeries.findIndex((value) => value !== null);
  if (firstMacdIndex === -1) {
    return { macd: null, signal: null, hist: null };
  }

  const macdValues = macdSeries.slice(firstMacdIndex).map((value) => value ?? 0);
  const signalSeries = emaSeries(macdValues, signalPeriod);
  const lastMacd = macdSeries[macdSeries.length - 1];
  const lastSignal = signalSeries[signalSeries.length - 1];

  if (lastMacd === null || lastSignal === null) {
    return { macd: lastMacd, signal: lastSignal, hist: null };
  }

  return {
    macd: lastMacd,
    signal: lastSignal,
    hist: lastMacd - lastSignal
  };
}

export function bollingerLatest(
  values: number[],
  period: number,
  stdDev: number
): { upper: number | null; middle: number | null; lower: number | null; width: number | null } {
  if (values.length < period || period <= 0) {
    return { upper: null, middle: null, lower: null, width: null };
  }
  const window = values.slice(values.length - period);
  const avg = mean(window);
  const sd = stddev(window);
  if (avg === null || sd === null) {
    return { upper: null, middle: null, lower: null, width: null };
  }
  const upper = avg + stdDev * sd;
  const lower = avg - stdDev * sd;
  const width = avg === 0 ? null : (upper - lower) / avg;
  return { upper, middle: avg, lower, width };
}
