import { baseApi } from "./baseApi";
import type {
  AccountBalanceOverviewResponse,
  ReplenishPrincipalForm,
  RoiDetailsResponse,
  RoiDetailsRequest,
  WithdrawPrincipalResponse,
  WithdrawPrincipalForm,
} from "@/types/accounting/accounting.types";
import { ENDPOINTS } from "@/constants/apiEndpoints";

export const accountingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET account balance overview */
    getAccountBalanceOverview: build.query<
      AccountBalanceOverviewResponse,
      void
    >({
      query: () => ({
        url: ENDPOINTS.ACCOUNTING.ACCOUNT_BALANCE_OVERVIEW,
        method: "GET",
      }),
      providesTags: [{ type: "Accounting" as const, id: "OVERVIEW" }],
    }),

    /** POST replenish principal (form-data) */
    replenishPrincipal: build.mutation<unknown, ReplenishPrincipalForm>({
      query: (body) => {
        const formData = new FormData();
        if (body.amount !== undefined && body.amount !== null)
          formData.append("amount", String(body.amount));
        if (body.purpose) formData.append("purpose", body.purpose);
        if (body.notes) formData.append("notes", body.notes);
        if (body.txId) formData.append("txId", body.txId);
        if (body.file) formData.append("file", body.file);

        return {
          url: ENDPOINTS.ACCOUNTING.REPLENISH_PRINCIPAL,
          method: "POST",
          data: formData,
        } as any;
      },
      invalidatesTags: [{ type: "Accounting" as const, id: "OVERVIEW" }],
    }),

    /**  withdraw principal (form-data). Use this for principal withdrawals. */
    withdrawPrincipal: build.mutation<
      WithdrawPrincipalResponse,
      WithdrawPrincipalForm
    >({
      query: (body) => {
        const formData = new FormData();
        formData.append("withdrawFrom", body.withdrawFrom);
        formData.append("amount", String(body.amount));
        if (body.purpose) formData.append("purpose", body.purpose);
        if (body.notes) formData.append("notes", body.notes);
        if (body.txId) formData.append("txId", body.txId);
        if (body.file) formData.append("file", body.file);
        return {
          url: ENDPOINTS.ACCOUNTING.WITHDRAW_PRINCIPAL,
          method: "POST",
          data: formData,
        } as any;
      },
      invalidatesTags: [{ type: "Accounting" as const, id: "OVERVIEW" }],
    }),

    /** GET withdraw history */
    getWithdrawHistory: build.query<any[], void>({
      query: () => ({
        url: ENDPOINTS.ACCOUNTING.WITHDRAW_HISTORY, // make sure this constant exists
        method: "GET",
      }),
      providesTags: (_res) => [
        { type: "Accounting" as const, id: "WITHDRAW_HISTORY" },
      ],
    }),

    /** GET ROI details */
    getRoiDetails: build.query<RoiDetailsResponse, void>({
      query: () => ({
        url: ENDPOINTS.ACCOUNTING.ROI_DETAILS,
        method: "GET",
      }),
      providesTags: [{ type: "Accounting" as const, id: "ROI" }],
    }),

    /** POST ROI details (update) */
    updateRoiDetails: build.mutation<RoiDetailsResponse, RoiDetailsRequest>({
      query: (body) => ({
        url: ENDPOINTS.ACCOUNTING.ROI_DETAILS,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Accounting" as const, id: "ROI" }],
    }),

    moveToNetProfit: build.mutation<any, void>({
      query: () => ({
        url: ENDPOINTS.ACCOUNTING.MOVE_TO_NET_PROFIT,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAccountBalanceOverviewQuery,
  useReplenishPrincipalMutation,
  useWithdrawPrincipalMutation,
  useGetWithdrawHistoryQuery,
  useGetRoiDetailsQuery,
  useUpdateRoiDetailsMutation,
  useMoveToNetProfitMutation,
} = accountingApi;
