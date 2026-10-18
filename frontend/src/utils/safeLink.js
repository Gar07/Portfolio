export function safeLink(value) {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? value : undefined;
  } catch { return undefined; }
}
