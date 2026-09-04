import type { PaymentMethod } from '@/lib/types';

/**
 * Central registry of payment methods. Only 'cod' is `enabled` today.
 * Adding Easypaisa/JazzCash/bank transfer/card later means:
 *   1. Add the method here with enabled: true and its own config shape.
 *   2. Add a case in app/(shop)/checkout/actions.ts that creates the
 *      order as payment_status: 'unpaid' and kicks off that gateway's
 *      redirect/intent flow.
 *   3. Add the gateway's webhook route under app/api/webhooks/<gateway>
 *      to flip payment_status to 'paid' server-side once confirmed.
 * No other part of the codebase needs to change — checkout, order schema,
 * and the admin order view are already gateway-agnostic.
 */
export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives.',
    enabled: true,
  },
  { id: 'easypaisa', label: 'Easypaisa', description: 'Coming soon', enabled: false },
  { id: 'jazzcash', label: 'JazzCash', description: 'Coming soon', enabled: false },
  { id: 'bank_transfer', label: 'Bank Transfer', description: 'Coming soon', enabled: false },
  { id: 'card', label: 'Debit / Credit Card', description: 'Coming soon', enabled: false },
];

export function getEnabledPaymentMethods(): PaymentMethodConfig[] {
  return PAYMENT_METHODS.filter((m) => m.enabled);
}
