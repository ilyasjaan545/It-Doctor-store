import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { productImageUrl } from '@/lib/image-url';
import { formatPKR } from '@/lib/money';
import AddToCartButton from '@/components/AddToCartButton';

// Define the Product type based on your schema
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock: number;
  image_path: string | null;
  is_active: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data as Product | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description?.slice(0, 160) || product.name,
    openGraph: {
      title: product.name,
      images: product.image_path ? [productImageUrl(product.image_path)!] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const imgUrl = productImageUrl(product.image_path);

  return (
    <div className="container-shop py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-card bg-white">
          {imgUrl ? (
            <Image 
              src={imgUrl} 
              alt={product.name} 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw" 
              className="object-cover" 
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-brand">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-brand">
              {formatPKR(product.price_cents)}
            </span>
            {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents && (
              <span className="text-base text-gray-400 line-through">
                {formatPKR(product.compare_at_price_cents)}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Currently out of stock'}
          </p>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="mb-2 text-sm font-semibold text-brand">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-card border border-border bg-white p-4 text-sm text-gray-600">
            <p>✓ Cash on Delivery available</p>
            <p>✓ Delivery charges calculated at checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
