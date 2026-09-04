'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MobileNav({ isAdmin, isSignedIn }: { isAdmin: boolean; isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-72 flex-col gap-1 bg-surface p-5 shadow-xl">
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="mb-4 self-end rounded-md p-1 hover:bg-muted"
            >
              ✕
            </button>
            <Link href="/products" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted">
              All Products
            </Link>
            <Link href="/products?category=mobiles" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted">
              Mobiles
            </Link>
            <Link href="/products?category=headphones" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted">
              Headphones
            </Link>
            <div className="my-2 border-t border-border" />
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted">
                Admin Dashboard
              </Link>
            )}
            <Link href={isSignedIn ? '/account' : '/login'} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted">
              {isSignedIn ? 'My Account' : 'Sign in'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
