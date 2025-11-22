import { ENDPOINTS } from "@/constants/apiEndpoints";
import { baseApi } from "./baseApi";
import {
  InvestmentSettlementsApi,
  InvestmentSettlementUserApi,
} from "@/types/InvestmentWithdraw/investmentWithdraw";

export const investmentSettlementsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllInvestmentSettlements: build.query<InvestmentSettlementsApi, void>({
      query: () => ({
        url: ENDPOINTS.INVESTMENTS.ALL_SETTLEMENTS,
        method: "GET",
      }),
      transformResponse: (response: any): InvestmentSettlementsApi => {
        if (!response) return [];
        if (Array.isArray(response))
          return response as InvestmentSettlementsApi;

        const maybeArray =
          response.data?.investmentSettlements ??
          response.investmentSettlements ??
          response.data ??
          response;

        if (Array.isArray(maybeArray))
          return maybeArray as InvestmentSettlementsApi;

        return [] as InvestmentSettlementsApi;
      },
      providesTags: (res) =>
        res
          ? [
              ...res.flatMap((user: InvestmentSettlementUserApi) =>
                user.investmentSettlements.map((s) => ({
                  type: "Investment" as const,
                  id: s.id,
                }))
              ),
              { type: "Investment" as const, id: "LIST" },
            ]
          : [{ type: "Investment" as const, id: "LIST" }],
    }),

    // APPROVE / SETTLE settlement
    approveInvestmentSettlement: build.mutation<
      any,
      { settlementId: number | string }
    >({
      query: ({ settlementId }) => ({
        url: `${ENDPOINTS.INVESTMENTS.SETTLE_INVESTMENT}/${settlementId}`,
        method: "GET",
      }),
      invalidatesTags: [{ type: "Investment", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllInvestmentSettlementsQuery,
  useApproveInvestmentSettlementMutation,
} = investmentSettlementsApi;
