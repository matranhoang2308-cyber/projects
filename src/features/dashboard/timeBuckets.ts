/**
 * Shared time-bucketing utilities for dashboard trend charts.
 *
 * Any chart that groups records by day/week/month/quarter/year should use
 * `bucketOf` to key + label each record, and `fillTimeSeries` (backed by
 * `generateTimeBuckets`) to render a continuous axis instead of only the
 * buckets that happen to contain data.
 */

export type TimeGranularity = "day" | "week" | "month" | "quarter" | "year";

export interface TimeBucketKey {
  key: string;
  label: string;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

/** Same day-of-year based week numbering already used across the dashboard charts. */
function weekOfYear(date: Date) {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86_400_000) + 1;
  return { year, week: Math.ceil((dayOfYear + startOfYear.getDay()) / 7) };
}

/** Derives the stable merge key + display label for a date at a given granularity. */
export function bucketOf(date: Date, granularity: TimeGranularity): TimeBucketKey {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  switch (granularity) {
    case "day":
      return {
        key: `${year}-${pad2(month)}-${pad2(date.getDate())}`,
        label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      };
    case "week": {
      const { year: weekYear, week } = weekOfYear(date);
      return { key: `${weekYear}-W${pad2(week)}`, label: `Tuần ${week}` };
    }
    case "month":
      return { key: `${year}-${pad2(month)}`, label: `Tháng ${month}/${year}` };
    case "quarter": {
      const quarter = Math.floor((month - 1) / 3) + 1;
      return { key: `${year}-Q${quarter}`, label: `Q${quarter}/${year}` };
    }
    case "year":
    default:
      return { key: String(year), label: String(year) };
  }
}

function bucketStart(date: Date, granularity: TimeGranularity): Date {
  const start = new Date(date.getTime());
  start.setHours(0, 0, 0, 0);
  if (granularity === "month") start.setDate(1);
  if (granularity === "quarter") start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
  if (granularity === "year") start.setMonth(0, 1);
  return start;
}

function stepDate(date: Date, granularity: TimeGranularity): Date {
  const next = new Date(date.getTime());
  if (granularity === "day") next.setDate(next.getDate() + 1);
  if (granularity === "week") next.setDate(next.getDate() + 7);
  if (granularity === "month") next.setMonth(next.getMonth() + 1);
  if (granularity === "quarter") next.setMonth(next.getMonth() + 3);
  if (granularity === "year") next.setFullYear(next.getFullYear() + 1);
  return next;
}

/** Generates every bucket between start and end (inclusive), inserting no gaps. */
export function generateTimeBuckets(start: Date, end: Date, granularity: TimeGranularity): TimeBucketKey[] {
  if (start.getTime() > end.getTime()) return [];

  const buckets: TimeBucketKey[] = [];
  const seen = new Set<string>();
  let cursor = bucketStart(start, granularity);
  const last = bucketStart(end, granularity);

  let guard = 0;
  const MAX_BUCKETS = 2000; // safety cap against runaway loops on bad input
  while (cursor.getTime() <= last.getTime() && guard < MAX_BUCKETS) {
    const bucket = bucketOf(cursor, granularity);
    if (!seen.has(bucket.key)) {
      seen.add(bucket.key);
      buckets.push(bucket);
    }
    cursor = stepDate(cursor, granularity);
    guard += 1;
  }
  return buckets;
}

/**
 * Widens [start, end] so it never excludes real data — used when the caller's
 * nominal window (e.g. "last 30 days") is narrower than the records that
 * actually passed filtering (e.g. a record dated in the future).
 */
export function widenRangeToCoverDates(start: Date, end: Date, actualDates: Date[]): { start: Date; end: Date } {
  let nextStart = start;
  let nextEnd = end;
  for (const date of actualDates) {
    if (date.getTime() < nextStart.getTime()) nextStart = date;
    if (date.getTime() > nextEnd.getTime()) nextEnd = date;
  }
  return { start: nextStart, end: nextEnd };
}

/**
 * Merges an actual-data map (keyed by `bucketOf(...).key`) onto a continuous
 * bucket range, so every bucket in [start, end] is represented — missing
 * buckets get `emptyValue(bucket)` instead of being omitted.
 */
export function fillTimeSeries<T>(
  grouped: Map<string, T>,
  range: { start: Date; end: Date },
  granularity: TimeGranularity,
  emptyValue: (bucket: TimeBucketKey) => T,
): T[] {
  return generateTimeBuckets(range.start, range.end, granularity).map((bucket) => grouped.get(bucket.key) ?? emptyValue(bucket));
}
