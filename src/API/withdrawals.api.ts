// src/API/withdrawals.api.ts
import { ENDPOINTS } from "@/constants/apiEndpoints";
import { baseApi } from "./baseApi";
import type { WithdrawApi } from "@/types/transactions/withdraw";

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

    // Patch update endpoint — body: { transactionId: number, status: "APPROVED"|"REJECTED"|"REVIEW"|... }
    updateWithdrawalStatus: build.mutation<
      any,
      { transactionId: number; status: string }
    >({
      query: ({ transactionId, status }) => ({
        url: ENDPOINTS.WITHDRAWALS.UPLOAD_WITHDRAWAL_PROOF,
        method: "PATCH",
        body: { transactionId, status },
      }),
      invalidatesTags: [{ type: "Withdrawals", id: "LIST" }],
    }),

    // New: upload withdraw proof endpoint (form-data)
    uploadWithdrawProof: build.mutation<
      any,
      { transactionId: number; file: File }
    >({
      query: ({ transactionId, file }) => {
        const form = new FormData();
        form.append("transactionId", String(transactionId));
        form.append("file", file);
        return {
          url: ENDPOINTS.WITHDRAWALS.UPLOAD_WITHDRAWAL_PROOF,
          method: "PATCH",
          data: form,
          headers: {},
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
