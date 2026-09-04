import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-brand">404</h1>
      <p className="mt-2 text-gray-500">Page not found.</p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
