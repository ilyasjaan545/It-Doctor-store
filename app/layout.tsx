import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'IT Doctor';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${storeName} — Mobiles & Headphones`,
    template: `%s | ${storeName}`,
  },
  description: `${storeName} — quality mobile phones and headphones with fast delivery across Pakistan. Cash on delivery available.`,
  openGraph: {
    type: 'website',
    siteName: storeName,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
