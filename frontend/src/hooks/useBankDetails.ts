import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBankDetails,
  createOrUpdateBankDetail,
  archiveBankDetail,
  BankDetail,
} from "@/api/bankDetails";
import { APIError } from "@/errors/APIError";

export const useBankDetails = (opts: { archived: boolean }) =>
  useQuery<BankDetail[], APIError>({
    queryKey: ["bank-details", opts.archived],
    queryFn: () => listBankDetails(opts.archived),
  });

export const useCreateBankDetail = () => {
  const qc = useQueryClient();

  return useMutation<
    BankDetail,
    APIError,
    Partial<BankDetail> & { id?: string }
  >({
    mutationFn: createOrUpdateBankDetail,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bank-details"] }), // подойдёт и для archived
  });
};

export const useArchiveBankDetail = () => {
  const qc = useQueryClient();
  return useMutation<
    { ok: boolean },
    APIError,
    { id: string; archived: boolean }
  >({
    mutationFn: ({ id, archived }) => archiveBankDetail(id, archived),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bank-details"] }),
  });
};
