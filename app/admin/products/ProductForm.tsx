'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct, uploadProductImage } from '../actions';
import type { Product, Category } from '@/lib/types';

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    categoryId: product?.category_id || '',
    price: product ? (product.price_cents / 100).toString() : '',
    compareAtPrice: product?.compare_at_price_cents ? (product.compare_at_price_cents / 100).toString() : '',
    stock: product ? String(product.stock) : '0',
    isActive: product?.is_active ?? true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      categoryId: form.categoryId || null,
      priceCents: Math.round(parseFloat(form.price || '0') * 100),
      compareAtPriceCents: form.compareAtPrice ? Math.round(parseFloat(form.compareAtPrice) * 100) : null,
      stock: parseInt(form.stock || '0', 10),
      isActive: form.isActive,
    };

    try {
      const result = product ? await updateProduct(product.id, input) : await createProduct(input);
      if (!result.ok) {
        setError(result.error || 'Something went wrong');
        return;
      }
      const productId = product?.id || result.id;

      if (file && productId) {
        const fd = new FormData();
        fd.set('file', file);
        const uploadResult = await uploadProductImage(productId, fd);
        if (!uploadResult.ok) {
          setError(uploadResult.error || 'Product saved, but image upload failed');
          return;
        }
      }

      router.push('/admin/products');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4 p-5">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Name</span>
        <input
          required
          className="input-field"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          onBlur={() => !form.slug && update('slug', slugify(form.name))}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Slug (URL)</span>
        <input required className="input-field" value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Description</span>
        <textarea className="input-field" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Category</span>
        <select className="input-field" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand">Price (PKR)</span>
          <input required type="number" min="0" step="1" className="input-field" value={form.price} onChange={(e) => update('price', e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand">Compare-at Price (optional)</span>
          <input type="number" min="0" step="1" className="input-field" value={form.compareAtPrice} onChange={(e) => update('compareAtPrice', e.target.value)} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Stock</span>
        <input required type="number" min="0" step="1" className="input-field" value={form.stock} onChange={(e) => update('stock', e.target.value)} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Product Image (JPEG/PNG/WebP, max 5MB)</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} />
        Visible in store
      </label>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
}
