import { useMutation } from "@tanstack/react-query";
import { login as loginApi, AuthResponse } from "@/api/user";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { APIError } from "@/errors/APIError";

/**
 * Хук авторизации трейдера через email + password.
 * Сохраняет полученный token в zustand + cookies + localStorage
 * и добавляет его в заголовки axios.
 */
export const useTraderAuth = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  /* ----- login ----- */
  const login = useMutation<
    AuthResponse,
    APIError,
    { email: string; password: string }
  >({
    mutationFn: ({ email, password }) => loginApi(email, password),

    onSuccess: (data) => {
      setTokens({ traderToken: data.token });
      router.replace("/trader");
    },
  });

  /* ----- logout ----- */
  const logout = () => {
    clear();
    router.replace("/trader/auth");
  };

  return { login, logout };
};
