import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <div>
      <section className="border-b border-border bg-white">
        <div className="container-shop grid gap-6 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
              Mobiles &amp; Headphones,<br className="hidden sm:block" /> delivered to your door.
            </h1>
            <p className="mt-4 max-w-md text-gray-600">
              Genuine products, fair prices, and Cash on Delivery across Pakistan.
            </p>
            <Link href="/products" className="btn-primary mt-6">
              Shop now
            </Link>
          </div>
          <div className="hidden aspect-video rounded-card bg-muted lg:block" />
        </div>
      </section>

      <section className="container-shop py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand">New Arrivals</h2>
          <Link href="/products" className="text-sm font-medium text-brand-accent hover:underline">
            View all
          </Link>
        </div>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No products yet — add some from the admin dashboard.
          </p>
        )}
      </section>
    </div>
  );
}
