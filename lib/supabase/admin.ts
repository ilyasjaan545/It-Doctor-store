import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

/**
 * SERVICE-ROLE client. Bypasses RLS entirely.
 *
 * `import 'server-only'` makes it a build error if this file is ever
 * imported from a Client Component or anything bundled for the browser —
 * that's the guard that keeps SUPABASE_SERVICE_ROLE_KEY out of client JS.
 *
 * Every function that uses this client MUST independently verify the
 * caller's authorization (e.g. requireAdmin() from lib/auth.ts) BEFORE
 * calling it. This client itself does not check who is calling — treat it
 * like a loaded gun: only use it after the permission check has already
 * passed.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY server env vars.'
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
