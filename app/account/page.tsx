import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/(auth)/actions';
import { formatPKR } from '@/lib/money';

export default async function AccountPage() {
  let profile;
  try {
    profile = await requireUser();
  } catch {
    redirect('/login?next=/account');
  }

  const supabase = await createClient();
  // RLS (orders_select_own_or_admin) guarantees this only ever returns rows
  // where user_id = the signed-in user's own id — no explicit filter needed
  // here to stay safe, but we add one anyway for clarity/defense in depth.
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container-shop max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand">My Account</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-danger hover:underline">Sign out</button>
        </form>
      </div>

      <div className="card mb-6 p-4 text-sm">
        <p className="text-gray-500">Signed in as</p>
        <p className="font-medium text-brand">{profile.full_name || 'No name set'}</p>
      </div>

      <h2 className="mb-3 text-base font-semibold text-brand">Order History</h2>
      <div className="space-y-3">
        {(orders || []).map((o) => (
          <div key={o.id} className="card flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium text-brand capitalize">{o.status}</p>
              <p className="text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
            </div>
            <span className="font-semibold text-brand">{formatPKR(o.total_cents)}</span>
          </div>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="text-sm text-gray-400">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
