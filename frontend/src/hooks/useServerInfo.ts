import { useQuery } from "@tanstack/react-query";
import { fetchConnectionInfo } from "@/api/info";
import { ConnectionInfo } from "@/types/info";
import { APIError } from "@/errors/APIError";

/** React-Query хук: ip + user-agent текущего запроса */
export const useServerInfo = () =>
  useQuery<ConnectionInfo, APIError>({
    queryKey: ["server-info"],
    queryFn: fetchConnectionInfo,
    staleTime: 60_000, // кешируем на минуту, т.к. ip редко меняется
    refetchOnWindowFocus: false,
  });
