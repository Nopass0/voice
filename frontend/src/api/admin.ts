import api from "@/api/base";
import { z } from "zod";
import {
  MerchantSchema,
  MethodSchema,
  TransactionSchema,
  Merchant,
  Method,
  Transaction,
  UserSchema,
  UserWithPasswordSchema,
  UserDetailSchema,
  User,
} from "@/types/admin";
import { Paginated } from "@/types/common";

/* ---------- helper ---------- */
const parse = <T>(schema: z.ZodType<T>, data: unknown) => schema.parse(data);

/* ---------- auth ---------- */

/**
 * Проверяем, действителен ли admin-токен.
 * Любой эндпоинт из /api/admin/* подойдёт; выбрали /stats:
 * 200 → токен валиден, 401 / 403 → нет.
 */
export const validateAdminKey = async (token: string): Promise<void> => {
  await api.get("/api/admin/stats", {
    headers: { "x-admin-key": token }, // временно подменяем заголовок
  });
};

/* ---------- merchants ---------- */

export const createMerchant = async (name: string) =>
  parse(
    MerchantSchema,
    (await api.post("/api/admin/merchant/create", { name })).data,
  );

export const deleteMerchant = async (id: string) =>
  (await api.delete("/api/admin/merchant/delete", { data: { id } })).data as {
    ok: boolean;
  };

/* ---------- methods ---------- */

export const createMethod = async (body: Omit<Method, "id" | "isEnabled">) =>
  parse(
    MethodSchema,
    (await api.post("/api/admin/merchant/methods/create", body)).data,
  );

export const listMethods = async () =>
  parse(
    MethodSchema.array(),
    (await api.get("/api/admin/merchant/methods/list")).data,
  );

export const getMethodById = async (id: string) =>
  parse(
    MethodSchema,
    (await api.get(`/api/admin/merchant/methods/${id}`)).data,
  );

export const updateMethod = async (body: Method) =>
  parse(
    MethodSchema,
    (await api.put("/api/admin/merchant/methods/update", body)).data,
  );

export const deleteMethod = async (id: string) =>
  (await api.delete("/api/admin/merchant/methods/delete", { data: { id } }))
    .data as { ok: boolean };

export const assignMethod = async (merchantId: string, methodId: string) =>
  (
    await api.post("/api/admin/merchant/methods/assign", {
      merchantId,
      methodId,
    })
  ).data;

export const toggleMethod = async (id: string, isEnabled: boolean) =>
  (await api.put("/api/admin/merchant/methods/toggle", { id, isEnabled })).data;

export const unassignMethod = async (id: string) =>
  (await api.delete("/api/admin/merchant/methods/unassign", { data: { id } }))
    .data as { ok: boolean };

export const getMerchantMethods = async (merchantId: string) =>
  parse(
    z
      .object({ method: MethodSchema, isEnabled: z.boolean(), id: z.string() })
      .array(),
    (await api.get(`/api/admin/merchant/methods/merchant/${merchantId}`)).data,
  );

/* ---------- transactions ---------- */

export const createTransaction = async (
  body: Partial<Transaction> & { merchantId: string },
) =>
  parse(
    TransactionSchema,
    (await api.post("/api/admin/transactions/create", body)).data,
  );

export const listTransactions = async (
  params?: Record<string, string | number>,
) =>
  parse(
    z.object({ data: TransactionSchema.array(), meta: z.any() }),
    (await api.get("/api/admin/transactions/list", { params })).data,
  ) as Paginated<Transaction>;

export const getTransactionById = async (id: string) =>
  parse(
    TransactionSchema,
    (await api.get(`/api/admin/transactions/${id}`)).data,
  );

export const updateTransaction = async (body: Transaction) =>
  parse(
    TransactionSchema,
    (await api.put("/api/admin/transactions/update", body)).data,
  );

/* ---------- users ---------- */

/** Создание пользователя (возвращается plainPassword) */
export const createUser = async (
  body: Pick<User, "email" | "name" | "balanceUsdt" | "balanceRub">,
): Promise<z.infer<typeof UserWithPasswordSchema>> =>
  parse(
    UserWithPasswordSchema,
    (await api.post("/api/admin/create-user", body)).data,
  );

/** Список пользователей */
export const listUsers = async (): Promise<User[]> =>
  parse(UserSchema.array(), (await api.get("/api/admin/users")).data);

/** Детальная карточка */
export const getUserById = async (id: string) =>
  parse(UserDetailSchema, (await api.get(`/api/admin/user/${id}`)).data);

/** Обновление данных */
export const updateUser = async (body: User) =>
  parse(UserSchema, (await api.put("/api/admin/update-user", body)).data);

/** Удалить пользователя */
export const deleteUser = async (id: string) =>
  (await api.delete("/api/admin/delete-user", { data: { id } })).data as {
    ok: boolean;
  };

/** Заблокировать / разблокировать */
export const banUser = async (id: string) =>
  (await api.post("/api/admin/ban-user", { id })).data as { ok: boolean };

/** Сгенерировать новый пароль */
export const regeneratePassword = async (id: string) =>
  (await api.post("/api/admin/regenerate-password", { id })).data as {
    ok: boolean;
    newPassword: string;
  };

// src/api/admin.ts
export const fetchEnums = async () =>
  (await api.get("/api/admin/enums/all")).data as {
    methodType: string[];
    currency: string[];
    rateSource: string[];
  };
