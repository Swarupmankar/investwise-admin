// src/API/investments.api.ts
import { ENDPOINTS } from "@/constants/apiEndpoints";
import { baseApi } from "./baseApi";
import type {
  AdminInvestmentApiItem,
  AdminInvestmentWithDetails,
  Investment,
} from "@/types/client";

export const investmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminInvestments: build.query<AdminInvestmentWithDetails[], void>({
      query: () => ({
        url: ENDPOINTS.INVESTMENTS.ALL_INVESTMENTS,
        method: "GET",
      }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((inv) => ({
                type: "Investment" as const,
                id: inv.id,
              })),
              { type: "Investment" as const, id: "LIST" },
            ]
          : [{ type: "Investment" as const, id: "LIST" }],

      transformResponse: (res: unknown) => {
        const raw = (res ?? []) as AdminInvestmentApiItem[];

        return raw.map((inv, index): AdminInvestmentWithDetails => {
          let planType: Investment["planType"] = "monthly";
          if (inv.planType === "ReferralThreeMonths") {
            planType = "quarterly";
          } else if (inv.planType === "ReferralOnePercent") {
            planType = "monthly";
          }

          const status =
            inv.investmentStatus.toLowerCase() as Investment["status"];

          const syntheticId = `${inv.clientName}-${inv.createdAt}-${index}`;

          return {
            id: syntheticId,
            clientId: "",
            amount: Number(inv.amount),
            planType,
            startDate: inv.createdAt,
            status,
            returnCredited: Number(inv.lifetimeReturns),
            clientName: inv.clientName,
            referredBy: inv.referredBy,
            currentMonthReturns: Number(inv.currentMonthReturns),
            lifetimeReturns: Number(inv.lifetimeReturns),
            rawPlanType: inv.planType,
          };
        });
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminInvestmentsQuery } = investmentsApi;
