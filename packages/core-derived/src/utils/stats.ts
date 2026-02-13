export function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

export function mean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return sum(values) / values.length;
}

export function stddev(values: number[]): number | null {
  if (values.length < 2) {
    return null;
  }
  const avg = mean(values);
  if (avg === null) {
    return null;
  }
  const variance = values.reduce((acc, value) => acc + Math.pow(value - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function zscore(value: number, values: number[]): number | null {
  const sd = stddev(values);
  if (sd === null || sd === 0) {
    return null;
  }
  const avg = mean(values);
  if (avg === null) {
    return null;
  }
  return (value - avg) / sd;
}

export function pctChange(current: number, base: number): number | null {
  if (base === 0) {
    return null;
  }
  return (current - base) / base;
}

export function safeDiv(numerator: number, denominator: number): number | null {
  if (denominator === 0) {
    return null;
  }
  return numerator / denominator;
}
