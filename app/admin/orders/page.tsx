import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPKR } from '@/lib/money';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-success',
  cancelled: 'bg-red-100 text-danger',
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: orders } = await admin.from('orders').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brand">Orders</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-gray-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-muted">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-brand-accent hover:underline">
                    {o.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.phone}</td>
                <td className="px-4 py-3">{o.city}</td>
                <td className="px-4 py-3">{formatPKR(o.total_cents)}</td>
                <td className="px-4 py-3 uppercase">{o.payment_method}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_COLORS[o.status] || ''}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
