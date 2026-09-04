import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import NewCategoryForm from './NewCategoryForm';

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: categories } = await admin.from('categories').select('*').order('name');

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-brand">Categories</h1>
      <NewCategoryForm />
      <div className="card mt-6 divide-y divide-border">
        {(categories || []).map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{c.name}</span>
            <span className="text-gray-400">/{c.slug}</span>
          </div>
        ))}
        {(!categories || categories.length === 0) && (
          <p className="px-4 py-6 text-center text-sm text-gray-400">No categories yet</p>
        )}
      </div>
    </div>
  );
}
