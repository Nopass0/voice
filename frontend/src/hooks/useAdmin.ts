import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIError } from "@/errors/APIError";
import { useAuthStore } from "@/store/useAuthStore";
import * as adminApi from "@/api/admin";
import * as merchantApi from "@/api/admin/merchant";
import * as methodApi from "@/api/admin/method";
import { Transaction, User, UserDetail, UserWithPassword } from "@/types/admin";

export const useAdmin = () => {
  const qc = useQueryClient();
  const { adminKey } = useAuthStore();

  /* ---------- guard ---------- */
  const guard = useCallback(() => {
    if (!adminKey) throw new APIError("NO_KEY", "x-admin-key отсутствует");
  }, [adminKey]);

  /* ============================================================
     MERCHANTS  (пример: у вас тут методы, но название сохранил)
  ============================================================ */
  const merchants = useQuery({
    queryKey: ["merchants"],
    queryFn: () => {
      guard();
      return adminApi.listMethods();
    },
  });

  const createMerchant = useMutation({
    mutationFn: adminApi.createMerchant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchants"] }),
  });

  const deleteMerchant = useMutation({
    mutationFn: adminApi.deleteMerchant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchants"] }),
  });

  /* ============================================================
     METHODS
  ============================================================ */
  const methods = useQuery({
    queryKey: ["methods"],
    queryFn: adminApi.listMethods,
  });

  const createMethod = useMutation({
    mutationFn: adminApi.createMethod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["methods"] }),
  });

  const updateMethod = useMutation({
    mutationFn: adminApi.updateMethod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["methods"] }),
  });

  const deleteMethod = useMutation({
    mutationFn: adminApi.deleteMethod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["methods"] }),
  });

  /* ============================================================
     TRANSACTIONS
  ============================================================ */
  const listTransactions = (params?: Record<string, string | number>) =>
    useQuery({
      queryKey: ["transactions", params],
      queryFn: () => adminApi.listTransactions(params),
      keepPreviousData: true,
    });

  const createTransaction = useMutation({
    mutationFn: adminApi.createTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const updateTransaction = useMutation<Transaction, APIError, Transaction>({
    mutationFn: adminApi.updateTransaction,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["transaction", vars.id] }),
  });

  /* ============================================================
     USERS  (новые методы, если вы добавили ранее)
  ============================================================ */
  const users = useQuery({
    queryKey: ["users"],
    queryFn: adminApi.listUsers,
  });

  const userDetail = (id: string) =>
    useQuery<UserDetail, APIError>({
      queryKey: ["user", id],
      queryFn: () => adminApi.getUserById(id),
    });

  const createUser = useMutation<
    UserWithPassword,
    APIError,
    Pick<User, "email" | "name" | "balanceUsdt" | "balanceRub">
  >({
    mutationFn: adminApi.createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateUser = useMutation<User, APIError, User>({
    mutationFn: adminApi.updateUser,
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user", v.id] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const banUser = useMutation({
    mutationFn: adminApi.banUser,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user", id] });
    },
  });

  const regeneratePassword = useMutation({
    mutationFn: adminApi.regeneratePassword,
  });

  const enums = useQuery({ queryKey: ["enums"], queryFn: adminApi.fetchEnums });

  /* ──────────── merchants ──────────── */

  const updateMerchant = useMutation({
    mutationFn: merchantApi.updateMerchant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchants"] }),
  });

  const regenerateMerchantToken = useMutation({
    mutationFn: merchantApi.regenerateMerchantToken,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchants"] }),
  });

  /* ──────────── methods of single merchant ──────────── */
  const merchantMethods = (merchantId?: string) =>
    useQuery({
      queryKey: ["merchantMethods", merchantId],
      queryFn: () =>
        merchantId ? merchantApi.getMerchantMethods(merchantId) : [],
      enabled: !!merchantId,
    });

  const assignMethod = useMutation({
    mutationFn: ({
      merchantId,
      methodId,
    }: {
      merchantId: string;
      methodId: string;
    }) => merchantApi.assignMethod(merchantId, methodId),
    onSuccess: (_data, { merchantId }) => {
      qc.invalidateQueries({ queryKey: ["merchantMethods", merchantId] });
    },
  });

  const unassignMethod = useMutation({
    mutationFn: merchantApi.unassignMethod,
    onSuccess: (_data, id) => {
      // id – merchantMethodId → надо узнать merchantId в invalidates, поэтому проще invalidate всё
      qc.invalidateQueries({ queryKey: ["merchantMethods"] });
    },
  });

  const toggleMethod = useMutation({
    mutationFn: merchantApi.toggleMethod,
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ["merchantMethods"] });
    },
  });

  /* ============================================================
     PUBLIC API
  ============================================================ */
  return {
    // merchants
    merchants,
    createMerchant,
    deleteMerchant,
    updateMerchant,
    regenerateMerchantToken,

    // methods
    methods,
    createMethod,
    updateMethod,
    deleteMethod,

    /* per-merchant */
    merchantMethods,
    assignMethod,
    unassignMethod,
    toggleMethod,

    // transactions
    listTransactions,
    createTransaction,
    updateTransaction,

    // users
    users,
    userDetail,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    regeneratePassword,

    // enums
    enums,
  };
};
