import api from "@/api/base";
import { z } from "zod";
import { Paginated } from "@/types/common";

/* --------------------------------------------------------------------------
 *  Общий helper для безопасного парсинга ответа через Zod
 * ------------------------------------------------------------------------*/
const parse = <T>(schema: z.ZodType<T>, data: unknown) => schema.parse(data);

/* --------------------------------------------------------------------------
 *  Схемы и типы
 * ------------------------------------------------------------------------*/
export const UserPublicSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  balanceUsdt: z.number(),
  balanceRub: z.number(),
  createdAt: z.string(),
});

export const AuthResponseSchema = UserPublicSchema.extend({
  token: z.string(),
});

export type User = z.infer<typeof UserPublicSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/* --------------------------------------------------------------------------
 *  /user/auth — логин: email + password → токен + публичные поля пользователя
 * ------------------------------------------------------------------------*/
export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> =>
  parse(
    AuthResponseSchema,
    (
      await api.post("/api/user/auth", {
        email,
        password,
      })
    ).data,
  );

/* --------------------------------------------------------------------------
 *  /user/me — текущий пользователь (по токену в заголовке x-trader-token)
 * ------------------------------------------------------------------------*/
export const getMe = async (): Promise<User> =>
  parse(UserPublicSchema, (await api.get("/api/user/me")).data);

/* --------------------------------------------------------------------------
 *  /user/balance — баланс текущего пользователя
 * ------------------------------------------------------------------------*/
export const getBalance = async (): Promise<User> =>
  parse(UserPublicSchema, (await api.get("/api/user/balance")).data);

/* --------------------------------------------------------------------------
 *  /user/sessions — список всех сессий пользователя
 * ------------------------------------------------------------------------*/
const SessionSchema = z.object({
  id: z.string(),
  token: z.string(),
  ip: z.string(),
  createdAt: z.string(),
  expiredAt: z.string(),
});

type Session = z.infer<typeof SessionSchema>;

export const listSessions = async (): Promise<Session[]> =>
  parse(SessionSchema.array(), (await api.get("/api/user/sessions")).data);

/* --------------------------------------------------------------------------
 *  DELETE /user/sessions/:id — удалить конкретную сессию
 * ------------------------------------------------------------------------*/
export const deleteSession = async (id: string): Promise<{ ok: boolean }> =>
  (await api.delete(`/api/user/sessions/${id}`)).data as { ok: boolean };

/* --------------------------------------------------------------------------
 *  DELETE /user/sessions — удалить все, кроме текущей
 * ------------------------------------------------------------------------*/
export const deleteOtherSessions = async (): Promise<{ ok: boolean }> =>
  (await api.delete("/api/user/sessions")).data as { ok: boolean };
