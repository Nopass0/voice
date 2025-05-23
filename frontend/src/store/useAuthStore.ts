// src/store/useAuthStore.ts
import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  PersistStorage, // <-- нужный тип
} from "zustand/middleware";
import api from "@/api/base";
import Cookies from "js-cookie";

const isServer = typeof window === "undefined";

/* PersistStorage, совместимый с типами zustand/persist */
const noopStorage: PersistStorage<object> = {
  getItem: () => null, // возвращаем null ─ это допустимо
  setItem: () => {}, // no-op
  removeItem: () => {},
};

interface AuthState {
  traderToken?: string;
  adminKey?: string;
  setTokens: (t: Partial<Pick<AuthState, "traderToken" | "adminKey">>) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      traderToken: !isServer
        ? (Cookies.get("x-trader-token") ?? undefined)
        : undefined,
      adminKey: !isServer
        ? (Cookies.get("x-admin-key") ?? undefined)
        : undefined,

      setTokens: ({ traderToken, adminKey }) =>
        set(() => {
          const next: Partial<AuthState> = {};
          if (!isServer && traderToken !== undefined) {
            Cookies.set("x-trader-token", traderToken);
            localStorage.setItem("x-trader-token", traderToken);
            next.traderToken = traderToken;

            api.defaults.headers.common["x-trader-token"] = traderToken;
          }
          if (!isServer && adminKey !== undefined) {
            Cookies.set("x-admin-key", adminKey);
            localStorage.setItem("x-admin-key", adminKey);
            next.adminKey = adminKey;

            api.defaults.headers.common["x-admin-key"] = adminKey;
          }
          return next; // обязательно вернуть объект!
        }),

      clear: () =>
        set(() => {
          if (!isServer) {
            Cookies.remove("x-trader-token");
            Cookies.remove("x-admin-key");
            localStorage.removeItem("x-trader-token");
            localStorage.removeItem("x-admin-key");
          }
          return { traderToken: undefined, adminKey: undefined };
        }),
    }),
    {
      name: "auth-store",
      storage: isServer
        ? noopStorage
        : createJSONStorage<AuthState>(() => localStorage), // теперь типы совпадают
    },
  ),
);
