import { z } from "zod";

/* ---------- merchants ---------- */
export const MerchantSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
  createdAt: z.string().datetime(),
});
export type Merchant = z.infer<typeof MerchantSchema>;

/* ---------- methods ---------- */
export const MethodSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.string(),
  currency: z.string(),
  commissionPayin: z.number(),
  commissionPayout: z.number(),
  maxPayin: z.number(),
  minPayin: z.number(),
  maxPayout: z.number(),
  minPayout: z.number(),
  chancePayin: z.number(),
  chancePayout: z.number(),
  isEnabled: z.boolean(),
  rateSource: z.string(),
});
export type Method = z.infer<typeof MethodSchema>;

/* ---------- transactions ---------- */
export const TransactionSchema = z.object({
  id: z.string(),
  numericId: z.number(),
  merchantId: z.string(),
  amount: z.number(),
  orderId: z.string(),
  methodId: z.string(),
  userId: z.string(),
  status: z.string(),
  type: z.string(),
  commission: z.number(),
  clientName: z.string(),
  isMock: z.boolean(),
  createdAt: z.string(),
  traderId: z.string(),
  updatedAt: z.string(),
  expired_at: z.string(),
  merchant: MerchantSchema,
  method: MethodSchema.pick({
    id: true,
    code: true,
    name: true,
    type: true,
    currency: true,
  }),
});
export type Transaction = z.infer<typeof TransactionSchema>;

/* ---------- users ---------- */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  balanceUsdt: z.number(),
  balanceRub: z.number(),
  banned: z.boolean().optional(),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const UserWithPasswordSchema = UserSchema.extend({
  plainPassword: z.string(),
});
export type UserWithPassword = z.infer<typeof UserWithPasswordSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  ip: z.string(),
  createdAt: z.string(),
  expiredAt: z.string(),
});
export const UserDetailSchema = UserSchema.extend({
  sessions: SessionSchema.array(),
});
export type UserDetail = z.infer<typeof UserDetailSchema>;

export const MerchantMethodSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  methodId: z.string(),
  isEnabled: z.boolean(),
  method: MethodSchema,
});
export type MerchantMethod = z.infer<typeof MerchantMethodSchema>;
