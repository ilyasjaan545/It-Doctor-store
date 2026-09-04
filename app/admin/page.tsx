import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';
import { formatPKR } from '@/lib/money';

export default async function AdminDashboardPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ count: productCount }, { count: orderCount }, { data: pendingOrders }, { data: recentOrders }] =
    await Promise.all([
      admin.from('products').select('*', { count: 'exact', head: true }),
      admin.from('orders').select('*', { count: 'exact', head: true }),
      admin.from('orders').select('id').eq('status', 'pending'),
      admin.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

  const revenue = (recentOrders || []).reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brand">Dashboard</h1>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Products" value={String(productCount ?? 0)} />
        <StatCard label="Total Orders" value={String(orderCount ?? 0)} />
        <StatCard label="Pending Orders" value={String(pendingOrders?.length ?? 0)} />
        <StatCard label="Recent Orders Value" value={formatPKR(revenue)} />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-brand">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders || []).map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-2">{o.full_name}</td>
                  <td className="py-2 capitalize">{o.status}</td>
                  <td className="py-2">{formatPKR(o.total_cents)}</td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr><td colSpan={3} className="py-4 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-brand">{value}</p>
    </div>
  );
}
