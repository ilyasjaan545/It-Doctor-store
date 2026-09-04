# IT Doctor — E-commerce Store

Next.js 14 (App Router, TypeScript) + Supabase (Postgres, Auth, Storage) + Tailwind.
Sells mobiles & headphones. Cash on Delivery at launch; architecture leaves room for
Easypaisa/JazzCash/bank transfer/card later without touching the checkout flow.

## 1. Supabase setup

1. Create a project at supabase.com.
2. Open the SQL Editor and run the entire contents of `supabase/schema.sql`.
   This creates every table, enables RLS on all of them, and adds the
   `create_order` function that checkout uses.
3. Settings → API: copy the **Project URL**, **anon public key**, and
   **service_role key**.
4. Copy `.env.local.example` to `.env.local` and fill in those three values
   plus `NEXT_PUBLIC_SITE_URL` (use `http://localhost:3000` for local dev).

## 2. Create your first admin

Regular sign-up always creates a `customer` (enforced by a DB trigger — a
customer can never promote themselves). To make yourself an admin:

1. Register an account normally at `/register` and confirm the email.
2. In the Supabase SQL Editor, run:
   ```sql
   select admin_set_user_role('<your-user-uuid-from-auth.users>', 'admin');
   ```
   Find your UUID under Authentication → Users in the Supabase dashboard.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Go to `/admin` (after step 2) to add
categories, products, upload the store logo, and set the delivery fee.

## 4. Deploy (GitHub → Vercel)

1. Push this repo to GitHub.
2. In Vercel: New Project → import the repo.
3. Add the same environment variables from `.env.local` in Vercel's
   Project Settings → Environment Variables. **Never commit `.env.local`.**
4. Deploy. Update `NEXT_PUBLIC_SITE_URL` to your real domain and redeploy.

Before going live, run `npm run typecheck` and `npm run build` locally —
both are configured to fail the build on any TypeScript or lint error
(see `next.config.js`), by design, so broken code can't reach production.

## Security model (what's enforced and where)

- **RLS everywhere.** Every table in `supabase/schema.sql` has Row Level
  Security enabled. Nothing in this codebase disables it.
- **Role can't be self-escalated.** `profiles.role` is only ever set to
  `admin` via `admin_set_user_role`, a Postgres function granted to the
  `service_role` only — and a trigger additionally blocks any direct
  update to `role` that isn't made by the service role.
- **`/admin` is not "security by obscurity".** `middleware.ts` does a
  cheap signed-in check at the edge, but the actual gate is
  `requireAdmin()` in `lib/auth.ts`, called at the top of the admin
  layout **and independently inside every single admin server action**
  in `app/admin/actions.ts`. It re-reads the role from the database every
  time — it never trusts a cookie, a cached value, or the fact that a
  request happened to hit `/admin/*`.
- **Prices are never trusted from the client.** Checkout
  (`app/(shop)/checkout/actions.ts`) sends only product IDs + quantities
  to the `create_order` Postgres function, which re-reads price and stock
  from `products` itself (row-locked, so two simultaneous checkouts can't
  oversell the last unit) and computes the total server-side. The cart's
  displayed prices are for UI only.
- **No card data is ever stored.** Only Cash on Delivery is implemented;
  when a real gateway is added later, card data goes straight to that
  gateway — this app is designed to only ever store a payment status.
- **Passwords are never touched manually.** Supabase Auth handles hashing
  and storage entirely; this codebase never sees a raw password after
  `signUp`/`signInWithPassword`.
- **`SUPABASE_SERVICE_ROLE_KEY` cannot leak to the browser.**
  `lib/supabase/admin.ts` imports the `server-only` package, which turns
  any accidental import of that file from client code into a build error.
- **Uploads are validated server-side**, not just by file extension:
  `lib/uploads.ts` checks an allow-list of MIME types, a 5MB size cap,
  and the file's actual magic bytes (so a renamed script can't pass as an
  image), before anything reaches Supabase Storage.
- **Input validation:** every server action validates its input with
  `zod` (`lib/validations.ts`) even though the same shapes also back the
  client forms — the client-side check is only ever a convenience.
- **Security headers** (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, restrictive `Permissions-Policy`) are set globally in
  `next.config.js`.

## What's intentionally NOT built yet (by design, per the brief)

These are structurally supported but not wired up, so they can be added
without reworking the schema or checkout flow:

- Other payment gateways — see `lib/payments.ts` for the extension point,
  and the `payment_method`/`payment_status` enums already in `orders`.
- Courier API integration, WhatsApp/Email/SMS notifications, multiple
  warehouses, multiple currencies, multi-language, multi-vendor,
  affiliate system, loyalty points, gift cards, advanced analytics.

## Project structure

```
app/
  (shop)/            storefront: products, cart, checkout
  (auth)/             login, register
  admin/              admin dashboard, guarded by requireAdmin()
  account/            customer order history (RLS-scoped to the user)
lib/
  supabase/           client.ts (browser), server.ts (per-request, RLS),
                      admin.ts (service-role, server-only)
  auth.ts             requireAdmin() / requireUser() — the real gate
  validations.ts      zod schemas used server-side
  uploads.ts          server-side image validation
  payments.ts         payment method registry (extensibility point)
supabase/
  schema.sql          full schema, RLS policies, create_order function
```

## Next steps you'll likely want

- Add product images for your real catalog from `/admin/products`.
- Set your real delivery fee in `/admin/settings`.
- Point a custom domain at the Vercel deployment.
- When ready for a second payment method, follow the steps documented at
  the top of `lib/payments.ts`.
