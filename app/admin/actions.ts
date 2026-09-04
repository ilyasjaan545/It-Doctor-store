'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { productSchema, type ProductInput } from '@/lib/validations';
import { validateImageUpload, buildStoragePath, UploadValidationError } from '@/lib/uploads';

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

/**
 * Every function below starts with `await requireAdmin()`. That call
 * re-reads the caller's role from the `profiles` table on every single
 * invocation — it is not cached, not trusted from a prior page load, and
 * not inferred from the fact that the request hit an /admin/* URL. A
 * server action can be invoked directly (bypassing the page entirely), so
 * this per-action check is the actual authorization boundary, not the
 * layout redirect.
 */

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();
  const { data, error } = await admin.from('products').insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    category_id: parsed.data.categoryId || null,
    price_cents: parsed.data.priceCents,
    compare_at_price_cents: parsed.data.compareAtPriceCents ?? null,
    stock: parsed.data.stock,
    is_active: parsed.data.isActive,
  }).select('id').single();

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { ok: true, id: data.id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      category_id: parsed.data.categoryId || null,
      price_cents: parsed.data.priceCents,
      compare_at_price_cents: parsed.data.compareAtPriceCents ?? null,
      stock: parsed.data.stock,
      is_active: parsed.data.isActive,
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { ok: true };
}

export async function uploadProductImage(productId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'No file provided' };

  try {
    await validateImageUpload(file);
  } catch (e) {
    if (e instanceof UploadValidationError) return { ok: false, error: e.message };
    throw e;
  }

  const admin = createAdminClient();
  const path = buildStoragePath(file.name, 'products');

  const { error: uploadError } = await admin.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: updateError } = await admin
    .from('products')
    .update({ image_path: path })
    .eq('id', productId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { ok: true };
}

export async function createCategory(name: string, slug: string): Promise<ActionResult> {
  await requireAdmin();
  if (!name.trim() || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, error: 'Invalid category name or slug' };
  }
  const admin = createAdminClient();
  const { error } = await admin.from('categories').insert({ name: name.trim(), slug });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/categories');
  return { ok: true };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) return { ok: false, error: 'Invalid status' };

  const admin = createAdminClient();
  const { error } = await admin.from('orders').update({ status }).eq('id', orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/orders');
  return { ok: true };
}

export async function updateStoreSettings(input: {
  storeName: string;
  flatDeliveryFeeCents: number;
  freeDeliveryThresholdCents: number | null;
}): Promise<ActionResult> {
  await requireAdmin();
  if (!input.storeName.trim() || input.flatDeliveryFeeCents < 0) {
    return { ok: false, error: 'Invalid settings' };
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from('store_settings')
    .update({
      store_name: input.storeName.trim(),
      flat_delivery_fee_cents: input.flatDeliveryFeeCents,
      free_delivery_threshold_cents: input.freeDeliveryThresholdCents,
    })
    .eq('id', true);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function uploadStoreLogo(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'No file provided' };

  try {
    await validateImageUpload(file);
  } catch (e) {
    if (e instanceof UploadValidationError) return { ok: false, error: e.message };
    throw e;
  }

  const admin = createAdminClient();
  const path = buildStoragePath(file.name, 'logo');

  const { error: uploadError } = await admin.storage
    .from('store-assets')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: updateError } = await admin
    .from('store_settings')
    .update({ logo_path: path })
    .eq('id', true);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}
