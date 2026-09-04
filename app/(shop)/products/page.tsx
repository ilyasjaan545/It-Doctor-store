import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = { title: 'All Products' };
export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const supabase = await createClient();

  let categoryId: string | null = null;
  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
    categoryId = cat?.id ?? null;
  }

  let query = supabase.from('products').select('*').eq('is_active', true);
  if (category) {
    // categoryId is null when the slug doesn't match any category — filtering
    // on a non-existent id correctly returns an empty result set.
    query = query.eq('category_id', categoryId ?? '00000000-0000-0000-0000-000000000000');
  }
  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data: products } = await query.order('created_at', { ascending: false });
  const filtered = products || [];

  return (
    <div className="container-shop py-8">
      <h1 className="mb-6 text-2xl font-semibold text-brand">
        {category ? category[0].toUpperCase() + category.slice(1) : 'All Products'}
      </h1>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No products found.</p>
      )}
    </div>
  );
                         }
