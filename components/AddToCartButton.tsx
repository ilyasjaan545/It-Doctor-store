'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/types';

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imagePath: product.image_path,
      displayPriceCents: product.price_cents,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-md border border-border">
        <button
          type="button"
          className="px-3 py-2 text-lg disabled:opacity-40"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-10 text-center text-sm">{qty}</span>
        <button
          type="button"
          className="px-3 py-2 text-lg disabled:opacity-40"
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          disabled={outOfStock}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button type="button" className="btn-primary flex-1" onClick={handleAdd} disabled={outOfStock}>
        {outOfStock ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
      </button>
      <button
        type="button"
        className="btn-secondary flex-1"
        disabled={outOfStock}
        onClick={() => {
          handleAdd();
          router.push('/checkout');
        }}
      >
        Buy now
      </button>
    </div>
  );
}
