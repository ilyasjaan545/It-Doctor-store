import Link from 'next/link';
import { formatPKR } from '@/lib/money';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; subtotal?: string; delivery?: string; total?: string }>;
}) {
  const { order, subtotal, delivery, total } = await searchParams;

  if (!order) {
    return (
      <div className="container-shop py-16 text-center text-gray-500">
        No order found. <Link href="/products" className="text-brand-accent hover:underline">Continue shopping</Link>.
      </div>
    );
  }

  return (
    <div className="container-shop max-w-lg py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-success">
        ✓
      </div>
      <h1 className="text-2xl font-semibold text-brand">Order placed successfully!</h1>
      <p className="mt-2 text-sm text-gray-500">
        Order ID: <span className="font-mono">{order}</span>
      </p>

      <div className="card mt-6 space-y-2 p-5 text-left text-sm">
        {subtotal && (
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPKR(Number(subtotal))}</span>
          </div>
        )}
        {delivery && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span>{Number(delivery) === 0 ? 'Free' : formatPKR(Number(delivery))}</span>
          </div>
        )}
        {total && (
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-brand">
            <span>Total (Cash on Delivery)</span>
            <span>{formatPKR(Number(total))}</span>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        We&apos;ll contact you to confirm delivery details. Thank you for shopping with us!
      </p>
      <Link href="/products" className="btn-primary mt-6 inline-flex">
        Continue Shopping
      </Link>
    </div>
  );
}
