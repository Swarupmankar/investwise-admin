import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/constants/apiEndpoints";
import {
  CreateCurrentBalancePayload,
  CurrentBalanceRaw,
  DashboardStatsRaw,
  NetProfitResponse,
  OutflowStatsRaw,
} from "@/types/dashboard/stats.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //GET  STATS
    getDashboardStats: build.query<DashboardStatsRaw, void>({
      query: () => ({
        url: ENDPOINTS.DASHBOARD.STATS,
        method: "GET",
      }),
      providesTags: [{ type: "Dashboard", id: "STATS" }],
      keepUnusedDataFor: 60,
    }),

    // GET Outflow
    getOutflowStats: build.query<OutflowStatsRaw, void>({
      query: () => ({
        url: ENDPOINTS.DASHBOARD.OUTFLOW,
        method: "GET",
      }),
      providesTags: [{ type: "Dashboard", id: "OUTFLOW" }],
      keepUnusedDataFor: 60,
    }),

    // GET current-balance history
    getCurrentBalances: build.query<CurrentBalanceRaw[], void>({
      query: () => ({
        url: ENDPOINTS.DASHBOARD.CURRENT_BALANCES,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "Dashboard" as const,
                id: `balance-${r.id}`,
              })),
              { type: "Dashboard", id: "CURRENT_BALANCES" },
            ]
          : [{ type: "Dashboard", id: "CURRENT_BALANCES" }],
      keepUnusedDataFor: 60,
    }),

    //Net Profit
    getNetProfit: build.query<NetProfitResponse, void>({
      query: () => ({
        url: ENDPOINTS.DASHBOARD.NET_PROFIT,
        method: "GET",
      }),
      providesTags: [{ type: "Dashboard", id: "currentPnl" }],
      keepUnusedDataFor: 60,
    }),

    // POST create current-balance
    createCurrentBalance: build.mutation<any, CreateCurrentBalancePayload>({
      query: (payload) => ({
        url: ENDPOINTS.DASHBOARD.CURRENT_BALANCES,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        { type: "Dashboard", id: "CURRENT_BALANCES" },
        { type: "Dashboard", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetCurrentBalancesQuery,
  useCreateCurrentBalanceMutation,
  useGetNetProfitQuery,
  useGetOutflowStatsQuery,
} = dashboardApi;
