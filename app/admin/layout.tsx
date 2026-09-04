import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { logout } from '@/app/(auth)/actions';

/**
 * This layout wraps every /admin/* page. It independently re-checks the
 * caller's role by reading `profiles` fresh from the database (see
 * getCurrentProfile → requireAdmin chain in lib/auth.ts) — middleware.ts
 * only checked "is anyone signed in", so this is the real gate. Knowing the
 * /admin URL is never enough on its own: a signed-in customer lands here
 * and is redirected home before any admin markup or data is sent.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) redirect('/login?next=/admin');
  if (profile.role !== 'admin') redirect('/');

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-white p-4 md:block">
        <p className="mb-6 px-2 text-sm font-semibold text-brand">Admin</p>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded-md px-2 py-2 hover:bg-muted">Dashboard</Link>
          <Link href="/admin/products" className="block rounded-md px-2 py-2 hover:bg-muted">Products</Link>
          <Link href="/admin/categories" className="block rounded-md px-2 py-2 hover:bg-muted">Categories</Link>
          <Link href="/admin/orders" className="block rounded-md px-2 py-2 hover:bg-muted">Orders</Link>
          <Link href="/admin/settings" className="block rounded-md px-2 py-2 hover:bg-muted">Store Settings</Link>
        </nav>
        <form action={logout} className="mt-8">
          <button type="submit" className="w-full rounded-md px-2 py-2 text-left text-sm text-danger hover:bg-red-50">
            Sign out
          </button>
        </form>
      </aside>
      <div className="flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}
