export function toIsoTimestamp(value?: number | string | Date | null): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value === null || value === undefined) {
    return new Date().toISOString();
  }
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && String(asNumber) === value.trim()) {
    return new Date(asNumber).toISOString();
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return new Date().toISOString();
}
