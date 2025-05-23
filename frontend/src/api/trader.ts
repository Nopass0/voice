import api from "@/api/base";
import { z } from "zod";

/* --------------------------------------------------------------------------
 *  Zod‑схемы ответа от бекенда
 * ------------------------------------------------------------------------*/
const ReceiptSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  isChecked: z.boolean(),
  isFake: z.boolean(),
});

const MethodSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
  })
  .passthrough();

const MerchantSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

export const TransactionSchema = z
  .object({
    id: z.string(),
    numericId: z.number(),
    merchantId: z.string(),
    amount: z.number(),
    assetOrBank: z.string(),
    orderId: z.string(),
    methodId: z.string(),
    currency: z.string().nullable(),
    userId: z.string(),
    userIp: z.string().nullable(),
    callbackUri: z.string(),
    successUri: z.string(),
    failUri: z.string(),
    type: z.string(),
    expired_at: z.string(),
    commission: z.number(),
    clientName: z.string(),
    status: z.string(),
    rate: z.number().nullable(),
    traderId: z.string().nullable(),
    isMock: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    merchant: MerchantSchema.optional(),
    method: MethodSchema.optional(),
    receipts: ReceiptSchema.array().optional(),
  })
  .passthrough();

const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

const ListResponseSchema = z.object({
  data: TransactionSchema.array(),
  pagination: PaginationSchema,
});

const UpdateResponseSchema = z.object({
  success: z.boolean(),
  transaction: TransactionSchema,
});

/* --------------------------------------------------------------------------
 *  Типы TS
 * ------------------------------------------------------------------------*/
export type Transaction = z.infer<typeof TransactionSchema>;
export type ListResponse = z.infer<typeof ListResponseSchema>;
export type UpdateResponse = z.infer<typeof UpdateResponseSchema>;

/* --------------------------------------------------------------------------
 *  Helper parse
 * ------------------------------------------------------------------------*/
const parse = <T>(schema: z.ZodType<T>, data: unknown): T => schema.parse(data);

/* --------------------------------------------------------------------------
 *  REST‑функции
 * ------------------------------------------------------------------------*/

/**
 * GET /trader/transactions — список транзакций трейдера
 */
export const listTransactions = async (
  params?: Partial<{
    page: number;
    limit: number;
    status: string;
    type: string;
  }>,
): Promise<ListResponse> =>
  parse(
    ListResponseSchema,
    (await api.get("/api/trader/transactions", { params })).data,
  );

/**
 * GET /trader/transactions/:id — детальная карточка
 */
export const getTransactionById = async (id: string): Promise<Transaction> =>
  parse(
    TransactionSchema,
    (await api.get(`/api/trader/transactions/${id}`)).data,
  );

/**
 * PATCH /trader/transactions/:id/status — изменение статуса
 */
export const updateTransactionStatus = async (
  id: string,
  status: string,
): Promise<UpdateResponse> =>
  parse(
    UpdateResponseSchema,
    (
      await api.patch(`/api/trader/transactions/${id}/status`, {
        status,
      })
    ).data,
  );
