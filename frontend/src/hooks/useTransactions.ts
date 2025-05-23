/* --------------------------------------------------------------
   /src/hooks/useTransactions.ts
-------------------------------------------------------------- */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/base"; // ваш axios-инстанс с baseURL

export type Transaction = Awaited<ReturnType<typeof fetchList>>["data"][number];

const fetchList = async (params: Record<string, any>) =>
  (await api.get("/api/admin/transactions/list", { params })).data;

const fetchOne = async (id: string) =>
  (await api.get(`/api/admin/transactions/${id}`)).data;

const createTxn = async (payload: any) =>
  (await api.post("/api/admin/transactions/create", payload)).data;

const updateTxn = async (id: string, payload: any) =>
  (await api.patch(`/api/admin/transactions/${id}`, payload)).data;

export function useTransactions(filters: Record<string, any>) {
  return useQuery({
    queryKey: ["txns", filters],
    queryFn: () => fetchList(filters),
    keepPreviousData: true,
  });
}

export function useTransaction(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["txn", id],
    queryFn: () => fetchOne(id!),
  });
}

export function useCreateTxn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTxn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["txns"] }),
  });
}

export function useUpdateTxn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => updateTxn(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["txns"] }),
  });
}
