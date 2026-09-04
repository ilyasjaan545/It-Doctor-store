'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

/**
 * Browser-side client. Uses ONLY the public anon key, which is safe to
 * expose — RLS policies (see supabase/schema.sql) are what actually
 * enforce access control, not this file.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
