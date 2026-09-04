import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '../ProductForm';

export default async function NewProductPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: categories } = await admin.from('categories').select('*').order('name');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brand">New Product</h1>
      <ProductForm categories={categories || []} />
    </div>
  );
}
