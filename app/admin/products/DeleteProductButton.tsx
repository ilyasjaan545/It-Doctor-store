'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '../actions';

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-danger hover:underline">
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-gray-500">Sure?</span>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteProduct(productId);
            router.refresh();
          })
        }
        className="text-xs font-medium text-danger hover:underline"
      >
        Yes
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-gray-500 hover:underline">
        Cancel
      </button>
    </span>
  );
}
