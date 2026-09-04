'use server';

import { createClient } from '@/lib/supabase/server';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations';
import { getEnabledPaymentMethods } from '@/lib/payments';

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string;
  subtotalCents?: number;
  deliveryFeeCents?: number;
  totalCents?: number;
  error?: string;
}

/**
 * Places an order. The client sends product IDs + quantities only — never
 * a price or total. This action re-validates the shape with zod, confirms
 * the requested payment method is actually enabled, and then delegates the
 * real work to the `create_order` Postgres function, which re-reads price
 * and stock from the database inside a locked transaction. Nothing here
 * (or in the DB function) ever reads a price/total sent by the browser.
 */
export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Invalid order details' };
  }
  const data = parsed.data;

  const enabled = getEnabledPaymentMethods().map((m) => m.id);
  if (!enabled.includes(data.paymentMethod)) {
    return { ok: false, error: 'Selected payment method is not available' };
  }

  const supabase = await createClient();

  const { data: summary, error } = await supabase.rpc('create_order', {
    p_full_name: data.fullName,
    p_email: data.email,
    p_phone: data.phone,
    p_address: data.address,
    p_city: data.city,
    p_province: data.province,
    p_postal_code: data.postalCode,
    p_delivery_notes: data.deliveryNotes || null,
    p_payment_method: data.paymentMethod,
    p_items: data.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
  });

  if (error) {
    // Postgres exceptions raised inside create_order (out of stock, inactive
    // product, empty cart, etc.) land here with a user-safe message.
    return { ok: false, error: error.message };
  }

  const result = summary as {
    order_id: string;
    subtotal_cents: number;
    delivery_fee_cents: number;
    total_cents: number;
  };

  return {
    ok: true,
    orderId: result.order_id,
    subtotalCents: result.subtotal_cents,
    deliveryFeeCents: result.delivery_fee_cents,
    totalCents: result.total_cents,
  };
}
