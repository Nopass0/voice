import { z } from "zod";

/** Ответ health-check эндпоинта */
export const ConnectionInfoSchema = z.object({
  ip: z.string(), // IP клиента, как его видит сервер
  userAgent: z.string(), // UA-строка запроса
});
export type ConnectionInfo = z.infer<typeof ConnectionInfoSchema>;
