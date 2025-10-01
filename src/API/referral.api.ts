// src/API/referral.api.ts
import { baseApi } from "./baseApi";
import type { ReferralOverviewResponse } from "@/types/users/referral.types";
import { ENDPOINTS } from "@/constants/apiEndpoints";

export const referralApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReferralByUserId: build.query<ReferralOverviewResponse | null, number>({
      query: (userId) => {
        console.log("[Referral API] Fetching referral for userId:", userId);
        return {
          url: ENDPOINTS.USERS.REFERRAL(userId),
          method: "GET" as const,
        };
      },

      providesTags: (result, error, userId) =>
        result
          ? [{ type: "Referral" as const, id: userId }]
          : [{ type: "Referral" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetReferralByUserIdQuery } = referralApi;
export default referralApi;
