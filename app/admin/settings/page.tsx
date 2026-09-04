import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import SettingsForm from './SettingsForm';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: settings } = await admin.from('store_settings').select('*').single();

  const logoUrl = settings?.logo_path
    ? admin.storage.from('store-assets').getPublicUrl(settings.logo_path).data.publicUrl
    : null;

  if (!settings) return <p className="text-sm text-danger">Store settings row missing — check the schema.sql setup.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-brand">Store Settings</h1>
      <SettingsForm settings={settings} logoUrl={logoUrl} />
    </div>
  );
}
