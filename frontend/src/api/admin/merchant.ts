/* --------------------------------------------------------------
   API helpers for merchants
-------------------------------------------------------------- */
import api from "@/api/base";
import { z } from "zod";
import {
  MerchantSchema,
  MethodSchema,
  MerchantMethodSchema,
} from "@/types/admin";

/* ---------- utils ---------- */
const parse = <T>(schema: z.ZodType<T>, data: unknown) => schema.parse(data);

/* ---------- merchants ---------- */
export const listMerchants = async () =>
  parse(
    MerchantSchema.array(),
    (await api.get("/api/admin/merchant/list")).data,
  );

export const createMerchant = async (name: string) =>
  parse(
    MerchantSchema,
    (await api.post("/api/admin/merchant/create", { name })).data,
  );

export const updateMerchant = async (payload: { id: string; name: string }) =>
  parse(
    MerchantSchema,
    (await api.put("/api/admin/merchant/update", payload)).data,
  );

export const deleteMerchant = async (id: string) =>
  (await api.delete("/api/admin/merchant/delete", { data: { id } })).data as {
    ok: boolean;
  };

export const regenerateMerchantToken = async (id: string) =>
  (await api.post("/api/admin/merchant/regenerate-token", { id }))
    .data as string;

/* ---------- all methods ---------- */
export const listMethods = async () =>
  parse(
    MethodSchema.array(),
    (await api.get("/api/admin/merchant/methods/list")).data,
  );

/* ---------- methods of a concrete merchant ---------- */
export const getMerchantMethods = async (merchantId: string) =>
  parse(
    MerchantMethodSchema.array(),
    (await api.get(`/api/admin/merchant/methods/merchant/${merchantId}`)).data,
  );

export const assignMethod = async (merchantId: string, methodId: string) =>
  (
    await api.post("/api/admin/merchant/methods/assign", {
      merchantId,
      methodId,
    })
  ).data;

export const unassignMethod = async (id: string) =>
  (await api.delete("/api/admin/merchant/methods/unassign", { data: { id } }))
    .data as { ok: boolean };

export const toggleMethod = async (payload: {
  id: string;
  isEnabled: boolean;
}) =>
  (await api.put("/api/admin/merchant/methods/toggle", payload)).data as {
    ok: boolean;
  };
