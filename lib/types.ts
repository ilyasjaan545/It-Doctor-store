export type UserRole = 'customer' | 'admin';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentMethod = 'cod' | 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'card';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock: number;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  delivery_notes: string | null;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

export interface StoreSettings {
  id: true;
  store_name: string;
  logo_path: string | null;
  flat_delivery_fee_cents: number;
  free_delivery_threshold_cents: number | null;
  updated_at: string;
}

// Minimal Database type for @supabase/ssr generics. Regenerate the real
// version any time with:
//   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
// and swap this import out — this hand-written version is a safe starting
// point so the app type-checks before that's set up.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
      store_settings: { Row: StoreSettings; Insert: Partial<StoreSettings>; Update: Partial<StoreSettings> };
    };
    Functions: {
      create_order: {
        Args: {
          p_full_name: string;
          p_email: string;
          p_phone: string;
          p_address: string;
          p_city: string;
          p_province: string;
          p_postal_code: string;
          p_delivery_notes: string | null;
          p_payment_method: PaymentMethod;
          p_items: { product_id: string; quantity: number }[];
        };
        Returns: {
          order_id: string;
          subtotal_cents: number;
          delivery_fee_cents: number;
          total_cents: number;
        };
      };
      admin_set_user_role: {
        Args: { target_user: string; new_role: UserRole };
        Returns: undefined;
      };
    };
  };
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imagePath: string | null;
  // Price shown client-side for UX only — the checkout action re-reads the
  // real price from the database and ignores this value for the actual total.
  displayPriceCents: number;
  quantity: number;
}
