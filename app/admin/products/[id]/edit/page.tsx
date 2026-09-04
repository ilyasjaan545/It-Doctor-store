import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '../../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    admin.from('products').select('*').eq('id', id).single(),
    admin.from('categories').select('*').order('name'),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brand">Edit Product</h1>
      <ProductForm product={product} categories={categories || []} />
    </div>
  );
}
