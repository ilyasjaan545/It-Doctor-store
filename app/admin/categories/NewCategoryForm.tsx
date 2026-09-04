'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory } from '../actions';

export default function NewCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createCategory(name, slugify(name));
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || 'Something went wrong');
      return;
    }
    setName('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card flex gap-2 p-4">
      <input
        required
        placeholder="e.g. Mobiles"
        className="input-field"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" className="btn-primary shrink-0" disabled={submitting}>
        Add
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}
