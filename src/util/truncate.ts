/**
 * Truncate strings after max length.
 * @param n Maximum string length before truncating with ...
 * @param text The text to truncate.
 */
export function truncate(n: number, text: string): string {
  return text.length > n ? text.substr(0, n - 1) + '...' : text;
}
