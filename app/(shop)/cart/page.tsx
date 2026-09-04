'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { productImageUrl } from '@/lib/image-url';
import { formatPKR } from '@/lib/money';

export default function CartPage() {
  const { items, setQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = items.reduce((sum, i) => sum + i.displayPriceCents * i.quantity, 0);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-shop py-16 text-center">
        <p className="mb-4 text-gray-500">Your cart is empty.</p>
        <Link href="/products" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-8">
      <h1 className="mb-6 text-2xl font-semibold text-brand">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const imgUrl = productImageUrl(item.imagePath);
            return (
              <div key={item.productId} className="card flex gap-4 p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-muted">
                  {imgUrl && <Image src={imgUrl} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/products/${item.slug}`} className="text-sm font-medium text-brand hover:underline">
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        className="px-2.5 py-1 text-base"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="px-2.5 py-1 text-base"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPKR(item.displayPriceCents * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 text-base font-semibold text-brand">Order Summary</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Delivery charges are calculated at checkout.
          </p>
          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
          }
