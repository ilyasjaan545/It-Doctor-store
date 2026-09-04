import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

/**
 * Returns the signed-in user's profile (including role) by reading it
 * through the per-request server client, which is bound to RLS — so this
 * can only ever return the caller's own row, never anyone else's.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile ?? null;
}

/**
 * Throws unless the current request comes from a signed-in admin.
 *
 * This is the ONLY function that should gate admin server actions / route
 * handlers / layouts. It re-checks the role from the database on every
 * call — it never trusts a role passed in from the client, a cookie value,
 * or anything cached — because the request could be hitting a server
 * action directly (not just a page load), and knowing the /admin URL must
 * never be enough on its own.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: admin access required');
  }
  return profile;
}

/** Throws unless someone is signed in at all. Returns their profile. */
export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error('Unauthorized: sign-in required');
  }
  return profile;
}
