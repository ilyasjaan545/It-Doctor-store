export default function Footer() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'IT Doctor';
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-shop grid gap-8 py-10 text-sm text-gray-600 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-base font-semibold text-brand">{storeName}</p>
          <p>Quality mobile phones &amp; headphones, delivered across Pakistan.</p>
        </div>
        <div>
          <p className="mb-2 font-medium text-brand">Shop</p>
          <ul className="space-y-1">
            <li><a href="/products" className="hover:text-brand-accent">All Products</a></li>
            <li><a href="/products?category=mobiles" className="hover:text-brand-accent">Mobiles</a></li>
            <li><a href="/products?category=headphones" className="hover:text-brand-accent">Headphones</a></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-medium text-brand">Support</p>
          <ul className="space-y-1">
            <li>Cash on Delivery available nationwide</li>
            <li>More payment options coming soon</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
