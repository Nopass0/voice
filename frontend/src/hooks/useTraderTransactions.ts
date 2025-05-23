import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTransactions,
  getTransactionById,
  updateTransactionStatus,
  ListResponse,
  Transaction,
  UpdateResponse,
} from "@/api/trader";
import { APIError } from "@/errors/APIError";

/* --------------------------------------------------------------------------
 *  useTraderTransactions — список, карточка и обновление статуса
 * ------------------------------------------------------------------------*/

type ListParams = Partial<{
  page: number;
  limit: number;
  status: string;
  type: string;
}>;

/** Список транзакций трейдера с поддержкой фильтров и пагинации */
export const useTraderTransactions = (params?: ListParams) =>
  useQuery<ListResponse, APIError>({
    queryKey: ["trader-transactions", params],
    queryFn: () => listTransactions(params),
    keepPreviousData: true,
  });

/** Карточка конкретной транзакции */
export const useTraderTransaction = (id?: string) =>
  useQuery<Transaction, APIError>({
    queryKey: ["trader-transaction", id],
    queryFn: () => getTransactionById(id as string),
    enabled: !!id,
  });

/** Обновление статуса + обновление кэша */
export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateResponse, APIError, { id: string; status: string }>({
    mutationFn: ({ id, status }) => updateTransactionStatus(id, status),

    onSuccess: (data) => {
      // Обновляем кэш карточки
      queryClient.setQueryData(
        ["trader-transaction", data.transaction.id],
        data.transaction,
      );
      // Инвалидируем список
      queryClient.invalidateQueries({ queryKey: ["trader-transactions"] });
    },
  });
};
