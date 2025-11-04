import { ENDPOINTS } from "@/constants/apiEndpoints";
import { baseApi } from "./baseApi";
import type { DepositApi } from "@/types/transactions/deposit.types";

export const depositsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllDeposits: build.query<DepositApi[], void>({
      query: () => ({
        url: ENDPOINTS.DEPOSITS.ALL_DEPOSITS,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (!response) return [];
        if (Array.isArray(response)) return response as DepositApi[];
        if (Array.isArray(response.deposits))
          return response.deposits as DepositApi[];
        return (response.data?.deposits ??
          response.deposits ??
          []) as DepositApi[];
      },
      providesTags: (res) =>
        res
          ? [
              ...res.map((d) => ({ type: "Deposits" as const, id: d.id })),
              { type: "Deposits", id: "LIST" },
            ]
          : [{ type: "Deposits", id: "LIST" }],
    }),

    // status can be "APPROVED" | "REJECTED"; when REJECTED, include rejectionReason
    updateDepositStatus: build.mutation<
      any,
      {
        transactionId: number;
        status: "APPROVED" | "REJECTED";
        rejectionReason?: string;
      }
    >({
      query: ({ transactionId, status, rejectionReason }) => {
        return {
          url: ENDPOINTS.DEPOSITS.APPROVE_DEPOSITS,
          method: "PATCH",
          data: {
            transactionId,
            status,
            ...(status === "REJECTED" && rejectionReason
              ? { rejectionReason }
              : {}),
          },
        };
      },
      invalidatesTags: [{ type: "Deposits", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllDepositsQuery, useUpdateDepositStatusMutation } =
  depositsApi;
