'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateStoreSettings, uploadStoreLogo } from '../actions';
import type { StoreSettings } from '@/lib/types';

export default function SettingsForm({ settings, logoUrl }: { settings: StoreSettings; logoUrl: string | null }) {
  const router = useRouter();
  const [storeName, setStoreName] = useState(settings.store_name);
  const [deliveryFee, setDeliveryFee] = useState(String(settings.flat_delivery_fee_cents / 100));
  const [freeThreshold, setFreeThreshold] = useState(
    settings.free_delivery_threshold_cents ? String(settings.free_delivery_threshold_cents / 100) : ''
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const result = await updateStoreSettings({
      storeName,
      flatDeliveryFeeCents: Math.round(parseFloat(deliveryFee || '0') * 100),
      freeDeliveryThresholdCents: freeThreshold ? Math.round(parseFloat(freeThreshold) * 100) : null,
    });

    if (!result.ok) {
      setError(result.error || 'Something went wrong');
      setSubmitting(false);
      return;
    }

    if (logoFile) {
      const fd = new FormData();
      fd.set('file', logoFile);
      const uploadResult = await uploadStoreLogo(fd);
      if (!uploadResult.ok) {
        setError(uploadResult.error || 'Settings saved, but logo upload failed');
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-5">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Store Name</span>
        <input required className="input-field" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
      </label>

      <div>
        <span className="mb-1 block text-sm font-medium text-brand">Logo</span>
        <div className="flex items-center gap-4">
          {logoUrl && (
            <div className="relative h-14 w-14 overflow-hidden rounded bg-muted">
              <Image src={logoUrl} alt="Current logo" fill className="object-cover" />
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Flat Delivery Fee (PKR)</span>
        <input required type="number" min="0" step="1" className="input-field" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brand">Free Delivery Above (PKR, optional)</span>
        <input type="number" min="0" step="1" className="input-field" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} />
      </label>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      {saved && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-success">Settings saved.</p>}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  );
}
