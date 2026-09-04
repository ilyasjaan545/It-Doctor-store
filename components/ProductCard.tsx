import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { productImageUrl } from '@/lib/image-url';
import { formatPKR } from '@/lib/money';

export default function ProductCard({ product }: { product: Product }) {
  const imgUrl = productImageUrl(product.image_path);
  const outOfStock = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-brand px-2 py-1 text-[11px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-brand">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-semibold text-brand">{formatPKR(product.price_cents)}</span>
          {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents && (
            <span className="text-xs text-gray-400 line-through">
              {formatPKR(product.compare_at_price_cents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
