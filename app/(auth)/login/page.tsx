'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '../actions';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login({ email, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || 'Something went wrong');
      return;
    }
    router.push(searchParams.get('next') || '/');
    router.refresh();
  }

  return (
    <div className="container-shop flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <h1 className="mb-6 text-2xl font-semibold text-brand">Sign in</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand">Email</span>
          <input required type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand">Password</span>
          <input required type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Don&apos;t have an account? <Link href="/register" className="text-brand-accent hover:underline">Register</Link>
      </p>
    </div>
  );
}
