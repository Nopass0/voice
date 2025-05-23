import api from "@/api/base";
import { z } from "zod";

export const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  energy: z.number().nullable(),
  ethernetSpeed: z.number().nullable(),
  isOnline: z.boolean(),
  token: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BankDetailSchema = z.object({
  id: z.string(),
  cardNumber: z.string(),
  bankType: z.string(),
  recipientName: z.string(),
  phoneNumber: z.string().nullable(),
  minAmount: z.number(),
  maxAmount: z.number(),
  dailyLimit: z.number(),
  monthlyLimit: z.number(),
  maxCountTransactions: z.number().nullable(),
  intervalMinutes: z.number(),
  methodType: z.string(),
  turnoverDay: z.number(),
  turnoverTotal: z.number(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  hasDevice: z.boolean(),
  device: DeviceSchema.optional(),
});

export type Device = z.infer<typeof DeviceSchema>;
export type BankDetail = z.infer<typeof BankDetailSchema>;

const parse = <T>(s: z.ZodType<T>, d: unknown) => s.parse(d);

/* ---------- CRUD ---------- */
export const listBankDetails = async (archived = false) =>
  parse(
    BankDetailSchema.array(),
    (await api.get("/api/trader/bank-details", { params: { archived } })).data,
  );

export const createOrUpdateBankDetail = async (
  payload: Partial<BankDetail> & { id?: string },
) => {
  const { id, ...data } = payload; // <-- выбросили id из body
  return parse(
    BankDetailSchema,
    id
      ? (await api.put(`/api/trader/bank-details/${id}`, data)).data
      : (await api.post("/api/trader/bank-details", data)).data,
  );
};

export const archiveBankDetail = async (id: string, archived: boolean) =>
  (await api.patch(`/api/trader/bank-details/${id}/archive`, { archived }))
    .data as { ok: boolean };
