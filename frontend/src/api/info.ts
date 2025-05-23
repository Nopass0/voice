import api from "@/api/base";
import { ConnectionInfoSchema, ConnectionInfo } from "@/types/info";

/** Достаём ip + user-agent, указанными сервером */
export const fetchConnectionInfo = async (): Promise<ConnectionInfo> =>
  ConnectionInfoSchema.parse((await api.get("/api/info/connection")).data);
