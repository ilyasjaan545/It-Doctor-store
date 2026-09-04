import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('slug, updated_at').eq('is_active', true);

  return [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    ...(products || []).map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
