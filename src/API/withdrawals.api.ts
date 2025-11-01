// src/API/withdrawals.api.ts
import { ENDPOINTS } from "@/constants/apiEndpoints";
import { baseApi } from "./baseApi";
import type { WithdrawApi } from "@/types/transactions/withdraw.types";

export const withdrawalsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllWithdrawals: build.query<WithdrawApi[], void>({
      query: () => ({
        url: ENDPOINTS.WITHDRAWALS.ALL_WITHDRAWALS,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (!response) return [];
        if (Array.isArray(response)) return response as WithdrawApi[];
        if (Array.isArray(response.withdrawals))
          return response.withdrawals as WithdrawApi[];
        return (response.data?.withdrawals ??
          response.withdrawals ??
          []) as WithdrawApi[];
      },
      providesTags: (res) =>
        res
          ? [
              ...res.map((w) => ({ type: "Withdrawals" as const, id: w.id })),
              { type: "Withdrawals", id: "LIST" },
            ]
          : [{ type: "Withdrawals", id: "LIST" }],
    }),

    updateWithdrawalStatus: build.mutation<
      any,
      { transactionId: number; status: string }
    >({
      query: ({ transactionId, status }) => ({
        url: ENDPOINTS.WITHDRAWALS.UPDATE_WITHDRAWAL_STATUS,
        method: "PATCH",
        data: { transactionId, status }, // axios payload
      }),
      invalidatesTags: [{ type: "Withdrawals", id: "LIST" }],
    }),

    // ✅ transactionId is strictly number here
    uploadWithdrawProof: build.mutation<
      any,
      { transactionId: number; file: File; txId?: string }
    >({
      query: ({ transactionId, file, txId }) => {
        const form = new FormData();
        form.append("transactionId", String(transactionId)); // backend reads it from multipart
        if (txId) form.append("txId", txId.trim());
        form.append("file", file);

        // 🔎 DEBUG: log exactly what we send
        if (import.meta?.env?.DEV) {
          const entries: any[] = [];
          form.forEach((v, k) => {
            entries.push([
              k,
              v instanceof File
                ? { kind: "File", name: v.name, size: v.size, type: v.type }
                : v,
            ]);
          });
          // eslint-disable-next-line no-console
          console.log("[uploadWithdrawProof] payload", {
            transactionId,
            typeofTransactionId: typeof transactionId,
            txId,
            file: { name: file.name, size: file.size, type: file.type },
            formEntries: entries,
          });
        }

        return {
          url: ENDPOINTS.WITHDRAWALS.UPLOAD_WITHDRAWAL_PROOF,
          method: "PATCH",
          data: form,
        };
      },
      invalidatesTags: [{ type: "Withdrawals", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllWithdrawalsQuery,
  useUpdateWithdrawalStatusMutation,
  useUploadWithdrawProofMutation,
} = withdrawalsApi;
