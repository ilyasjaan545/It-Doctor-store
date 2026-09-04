import { z } from 'zod';

/**
 * Every one of these is re-run on the server (in server actions), even
 * though the same shapes are also used for client-side form UX. Client-side
 * validation is only ever a convenience — never trust it alone.
 */

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name is too short').max(120),
  email: z.string().trim().email('Invalid email address').max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,20}$/, 'Invalid phone number'),
  address: z.string().trim().min(5, 'Address is too short').max(400),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(20),
  deliveryNotes: z.string().trim().max(500).optional().or(z.literal('')),
  paymentMethod: z.literal('cod'), // only COD is live today; see lib/payments.ts
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'Cart is empty')
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, numbers and hyphens only'),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  categoryId: z.string().uuid().nullable().optional(),
  priceCents: z.number().int().min(0).max(999_999_999),
  compareAtPriceCents: z.number().int().min(0).max(999_999_999).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(120),
});
