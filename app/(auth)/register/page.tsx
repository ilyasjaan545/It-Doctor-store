'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '../actions';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await register({ fullName, email, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || 'Something went wrong');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="container-shop flex min-h-[70vh] max-w-md flex-col items-center justify-center py-12 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-brand">Check your email</h1>
        <p className="text-sm text-gray-500">We sent a confirmation link to {email}.</p>
        <Link href="/login" className="btn-primary mt-6">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="container-shop flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <h1 className="mb-6 text-2xl font-semibold text-brand">Create an account</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand">Full Name</span>
          <input required className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand">Email</span>
          <input required type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand">Password</span>
          <input required type="password" minLength={8} className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account? <Link href="/login" className="text-brand-accent hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
