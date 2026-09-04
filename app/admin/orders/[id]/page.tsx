import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPKR } from '@/lib/money';
import OrderStatusSelect from './OrderStatusSelect';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    admin.from('orders').select('*').eq('id', id).single(),
    admin.from('order_items').select('*').eq('order_id', id),
  ]);

  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-brand">Order Details</h1>

      <div className="card mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Placed {new Date(order.created_at).toLocaleString()}</p>
          <OrderStatusSelect orderId={order.id} status={order.status} />
        </div>
        <div className="grid gap-1 text-sm">
          <p><span className="text-gray-500">Name:</span> {order.full_name}</p>
          <p><span className="text-gray-500">Email:</span> {order.email}</p>
          <p><span className="text-gray-500">Phone:</span> {order.phone}</p>
          <p><span className="text-gray-500">Address:</span> {order.address}, {order.city}, {order.province} {order.postal_code}</p>
          {order.delivery_notes && <p><span className="text-gray-500">Notes:</span> {order.delivery_notes}</p>}
          <p><span className="text-gray-500">Payment:</span> {order.payment_method.toUpperCase()} ({order.payment_status})</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-base font-semibold text-brand">Items</h2>
        <div className="space-y-2 text-sm">
          {(items || []).map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>{i.product_name} × {i.quantity}</span>
              <span>{formatPKR(i.line_total_cents)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPKR(order.subtotal_cents)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatPKR(order.delivery_fee_cents)}</span></div>
          <div className="flex justify-between text-base font-semibold text-brand"><span>Total</span><span>{formatPKR(order.total_cents)}</span></div>
        </div>
      </div>
    </div>
  );
      }
