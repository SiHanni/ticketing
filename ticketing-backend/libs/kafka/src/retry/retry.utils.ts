export function getRetryCount(headers: Record<string, any>): number {
  const count = headers?.['x-retry-count'];
  return count ? Number(count) : 0;
}

export function createHeadersWithRetryCount(
  count: number,
): Record<string, any> {
  return { 'x-retry-count': String(count) };
}
