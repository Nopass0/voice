import { useMutation } from "@tanstack/react-query";
import { validateAdminKey } from "@/api/admin";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { APIError } from "@/errors/APIError";

/** Логин/логаут админа */
export const useAdminAuth = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  /* ----- login ----- */
  const login = useMutation<void, APIError, string>({
    mutationFn: validateAdminKey,
    onSuccess: (_, token) => {
      setTokens({ adminKey: token }); // кладём в zustand + cookies + LS
      router.replace("/admin"); // переходим в админку
    },
  });

  /* ----- logout ----- */
  const logout = () => {
    clear();
    router.replace("/admin/auth");
  };

  return { login, logout };
};
