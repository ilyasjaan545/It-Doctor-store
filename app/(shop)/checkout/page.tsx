'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { formatPKR } from '@/lib/money';
import { placeOrder } from './actions';
import { PAYMENT_METHODS } from '@/lib/payments';

const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad Capital Territory', 'Azad Kashmir'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    deliveryNotes: '',
  });

  useEffect(() => setMounted(true), []);

  const subtotal = items.reduce((sum, i) => sum + i.displayPriceCents * i.quantity, 0);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await placeOrder({
        ...form,
        deliveryNotes: form.deliveryNotes,
        paymentMethod: 'cod',
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      if (!result.ok) {
        setError(result.error || 'Could not place order. Please try again.');
        return;
      }
      clear();
      const params = new URLSearchParams({
        order: result.orderId!,
        subtotal: String(result.subtotalCents),
        delivery: String(result.deliveryFeeCents),
        total: String(result.totalCents),
      });
      router.push(`/checkout/success?${params.toString()}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-shop py-16 text-center text-gray-500">
        Your cart is empty. <a href="/products" className="text-brand-accent hover:underline">Go shopping</a>.
      </div>
    );
  }

  return (
    <div className="container-shop py-8">
      <h1 className="mb-6 text-2xl font-semibold text-brand">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-4 p-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" required>
              <input required className="input-field" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            </Field>
            <Field label="Email" required>
              <input required type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </Field>
          </div>
          <Field label="Phone" required>
            <input required className="input-field" placeholder="03XXXXXXXXX" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </Field>
          <Field label="Address" required>
            <input required className="input-field" value={form.address} onChange={(e) => update('address', e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" required>
              <input required className="input-field" value={form.city} onChange={(e) => update('city', e.target.value)} />
            </Field>
            <Field label="Province" required>
              <select required className="input-field" value={form.province} onChange={(e) => update('province', e.target.value)}>
                <option value="">Select</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Postal Code" required>
              <input required className="input-field" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} />
            </Field>
          </div>
          <Field label="Delivery Notes (optional)">
            <textarea className="input-field" rows={3} value={form.deliveryNotes} onChange={(e) => update('deliveryNotes', e.target.value)} />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-brand">Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2.5 text-sm ${
                    m.enabled ? 'border-border' : 'cursor-not-allowed border-border opacity-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input type="radio" name="paymentMethod" checked={m.id === 'cod'} disabled={!m.enabled} readOnly />
                    {m.label}
                  </span>
                  <span className="text-xs text-gray-400">{m.description}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </form>

        <div className="card h-fit p-5">
          <h2 className="mb-4 text-base font-semibold text-brand">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-gray-600">
                <span>{i.name} × {i.quantity}</span>
                <span>{formatPKR(i.displayPriceCents * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Delivery charges are calculated and confirmed on the order confirmation page.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brand">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}
