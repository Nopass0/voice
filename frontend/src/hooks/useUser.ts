/* --------------------------------------------------------------------------
 * useUser.ts — хук авторизации трейдера (публичный клиент)
 *
 * Отвечает за:
 *  - хранение / обновление токена
 *  - получение и кеширование данных пользователя
 *  - login / logout
 *  - helper refresh()
 * ------------------------------------------------------------------------*/

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/base";
import { login as apiLogin, getMe, User, AuthResponse } from "@/api/user";

/**
 * Ключ, под которым токен хранится в localStorage.
 * Совпадает с заголовком x-trader-token, чтобы не путаться.
 */
const TOKEN_KEY = "x-trader-token";

/**
 * Локальный helper: обновляет localStorage и дефолтные заголовки Axios.
 */
const saveToken = (token: string | null) => {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common["x-trader-token"] = token;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["x-trader-token"];
  }
};

export interface UseUserReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  /** Авторизация: email + password → заполнение стейта и редирект. */
  login: (email: string, password: string) => Promise<void>;
  /** Сброс токена, стейта и редирект на /login. */
  logout: () => void;
  /** Форс‑обновление данных «/user/me». Если токен протух, происходит logout(). */
  refresh: () => Promise<void>;
}

/**
 * Главный хук: предоставляет публичному приложению всю логику работы с текущим
 * пользователем. Использовать так:
 * const { user, loading, login, logout } = useUser();
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /* ------------------------- helpers ------------------------- */

  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
    setError(null);
    router.push("/login"); // при необходимости поменяйте путь
  }, [router]);

  const fetchMe = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      setError(null);
    } catch {
      // Токен недействителен → выходим.
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  /* ------------------ bootstrap — проверяем токен ------------------ */

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    if (storedToken) {
      api.defaults.headers.common["x-trader-token"] = storedToken;
      fetchMe();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------- actions --------------------------- */

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setLoading(true);
      try {
        const { token, ...userData }: AuthResponse = await apiLogin(
          email,
          password,
        );
        saveToken(token);
        setUser(userData);
        setError(null);
        router.push("/"); // после логина отправляем на главную
      } catch (e: any) {
        setError(e?.response?.data?.message || "Неверный email или пароль.");
        saveToken(null);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fresh = await getMe();
      setUser(fresh);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  /* ------------------------- returns ------------------------- */

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    refresh,
  };
}
