import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

/** Avoid hanging the dev server when Supabase is unreachable. */
const FETCH_TIMEOUT_MS = 8_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

let supabaseClient: any = null;

export function getSupabaseClient(): any {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: fetchWithTimeout },
    });
  }
  return supabaseClient;
}

// Lazy export for backward compatibility (used in modules as `supabase.from()`)
export const supabase = new Proxy({}, {
  get() {
    return getSupabaseClient();
  },
});

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon')) return false;
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

export function getSupabaseConfigHint(): string | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.example).';
  }
  if (!isSupabaseConfigured()) {
    return 'Replace placeholder Supabase values in .env.local with your project URL and anon key from Supabase → Settings → API.';
  }
  return null;
}
