/**
 * Best-effort, in-memory per-key rate limiter. Amplify's SSR compute can run
 * multiple warm instances, so this caps abuse per instance, not globally
 * across the whole deployment — a real speed bump against scripted abuse,
 * not a hard distributed guarantee. Combined with the per-request message
 * caps in the chat route, it's enough for a workshop-scale demo.
 */

type Window = { windowMs: number; max: number };

const WINDOWS: Window[] = [
  { windowMs: 60_000, max: 12 }, // burst: ~1 message every 5s
  { windowMs: 60 * 60_000, max: 120 }, // sustained: 120/hour
];

const LONGEST_WINDOW_MS = Math.max(...WINDOWS.map((w) => w.windowMs));
const MAX_TRACKED_KEYS = 5000;

const hitLog = new Map<string, number[]>();

export function checkRateLimit(key: string): {
  limited: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();

  // Crude memory safety valve so this Map can't grow unbounded over the
  // lifetime of a long-running warm instance.
  if (hitLog.size > MAX_TRACKED_KEYS) hitLog.clear();

  const recent = (hitLog.get(key) ?? []).filter(
    (t) => now - t < LONGEST_WINDOW_MS
  );

  for (const { windowMs, max } of WINDOWS) {
    const count = recent.filter((t) => now - t < windowMs).length;
    if (count >= max) {
      hitLog.set(key, recent);
      return { limited: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
    }
  }

  recent.push(now);
  hitLog.set(key, recent);
  return { limited: false };
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
