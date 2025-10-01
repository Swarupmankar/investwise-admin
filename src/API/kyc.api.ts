// src/API/kyc.api.ts
import { baseApi } from "./baseApi";
import type {
  KycRecord,
  KycActionResponse,
  KycReviewRequestBody,
  KycDeleteRequestBody,
} from "@/types/users/kyc.types";
import { ENDPOINTS } from "@/constants/apiEndpoints";

export const kycApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getKycByUserId: build.query<KycRecord | null, number | string>({
      query: (userId) => {
        const id = typeof userId === "string" ? Number(userId) : userId;
        console.log(
          "[KYC API] Building query with userId:",
          userId,
          "parsed:",
          id
        );

        const queryParams = id ? { userId: id, user_id: id } : undefined;

        const queryConfig = {
          url: ENDPOINTS.KYC.KYC_ALL_REQUESTS + (id ? `/${id}` : ""),
          method: "GET",
          params: queryParams,
        };

        console.log("[KYC API] Final query config:", queryConfig);

        return queryConfig;
      },
      transformResponse: (res: any) => {
        console.log("[KYC API] Raw server response:", res);
        const kyc = res?.data?.kyc;
        if (!kyc) {
          console.warn("[KYC API] No kyc field in response:", res);
          return null;
        }
        if (Array.isArray(kyc)) {
          console.log("[KYC API] Response kyc is array, taking first element");
          return kyc[0] ?? null;
        }
        return kyc;
      },
    }),

    /** -------  REVIEW document mutation ------- */

    reviewKycDocument: build.mutation<
      KycActionResponse,
      { kycId: number | string; body: KycReviewRequestBody }
    >({
      query: ({ kycId, body }) => {
        return {
          url: ENDPOINTS.KYC.KYC_REVIEW(kycId),
          method: "PATCH",
          data: body,
        };
      },
      invalidatesTags: (_res, _err, args) => [{ type: "KYC", id: args.kycId }],
    }),

    /** ------- New: Delete document mutation ------- */
    deleteKycDocument: build.mutation<
      KycActionResponse,
      { kycId: number | string; body: KycDeleteRequestBody }
    >({
      query: ({ kycId, body }) => {
        return {
          url: ENDPOINTS.KYC.KYC_DELETE(kycId),
          method: "DELETE",
          data: body,
        };
      },
      invalidatesTags: (_res, _err, args) => [{ type: "KYC", id: args.kycId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetKycByUserIdQuery,
  useReviewKycDocumentMutation,
  useDeleteKycDocumentMutation,
} = kycApi;
