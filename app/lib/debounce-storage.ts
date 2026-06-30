/** Debounced localStorage writes to avoid blocking the main thread on large catalogs. */
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function setStoredDebounced(key: string, value: unknown, delayMs = 400): void {
  if (typeof window === 'undefined') return;
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`[storage] Failed to save "${key}":`, e);
      }
    }, delayMs)
  );
}
