import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import CartBadgeLink from '@/components/CartBadgeLink';
import MobileNav from '@/components/MobileNav';

export default async function Header() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('store_settings').select('*').single();
  const profile = await getCurrentProfile();

  const storeName = settings?.store_name || process.env.NEXT_PUBLIC_STORE_NAME || 'IT Doctor';
  const logoUrl = settings?.logo_path
    ? supabase.storage.from('store-assets').getPublicUrl(settings.logo_path).data.publicUrl
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="container-shop flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileNav isAdmin={profile?.role === 'admin'} isSignedIn={!!profile} />
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <Image src={logoUrl} alt={storeName} width={36} height={36} className="rounded" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded bg-brand text-sm font-bold text-white">
                {storeName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="hidden text-lg font-semibold sm:inline">{storeName}</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/products" className="hover:text-brand-accent">All Products</Link>
          <Link href="/products?category=mobiles" className="hover:text-brand-accent">Mobiles</Link>
          <Link href="/products?category=headphones" className="hover:text-brand-accent">Headphones</Link>
        </nav>

        <div className="flex items-center gap-3">
          {profile?.role === 'admin' && (
            <Link href="/admin" className="hidden text-sm font-medium hover:text-brand-accent md:inline">
              Admin
            </Link>
          )}
          {profile ? (
            <Link href="/account" className="hidden text-sm font-medium hover:text-brand-accent md:inline">
              Account
            </Link>
          ) : (
            <Link href="/login" className="hidden text-sm font-medium hover:text-brand-accent md:inline">
              Sign in
            </Link>
          )}
          <CartBadgeLink />
        </div>
      </div>
    </header>
  );
}
