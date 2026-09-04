import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { productImageUrl } from '@/lib/image-url';
import { formatPKR } from '@/lib/money';
import DeleteProductButton from './DeleteProductButton';

export default async function AdminProductsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: products } = await admin.from('products').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">+ New Product</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-gray-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products || []).map((p) => {
              const img = productImageUrl(p.image_path);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                      {img && <Image src={img} alt={p.name} fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{formatPKR(p.price_cents)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? 'bg-green-100 text-success' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}/edit`} className="mr-3 text-brand-accent hover:underline">
                      Edit
                    </Link>
                    <DeleteProductButton productId={p.id} />
                  </td>
                </tr>
              );
            })}
            {(!products || products.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
