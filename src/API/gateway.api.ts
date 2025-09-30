// src/API/wallet.api.ts
import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/constants/apiEndpoints";
import { Wallet, WalletActivity } from "@/types/payment";

export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create wallet
    createWallet: build.mutation<
      Wallet,
      { nickname: string; network: string; address: string }
    >({
      query: (payload) => ({
        url: ENDPOINTS.GATEWAY.CREATE_WALLET,
        method: "POST",
        data: payload, // backend expects JSON as per your sample
      }),
      invalidatesTags: [{ type: "Gateway", id: "LIST" }],
    }),

    // Get all wallets
    getAllWallets: build.query<Wallet[], void>({
      query: () => ({
        url: ENDPOINTS.GATEWAY.ALL_WALLETS,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((w) => ({ type: "Gateway" as const, id: w.id })),
              { type: "Gateway" as const, id: "LIST" },
            ]
          : [{ type: "Gateway" as const, id: "LIST" }],
    }),

    // Set active wallet
    setActiveWallet: build.mutation<any, { id: number | string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.GATEWAY.SET_ACTIVE(id),
        method: "GET",
      }),
      invalidatesTags: [{ type: "Gateway", id: "LIST" }],
    }),

    // Delete wallet
    deleteWallet: build.mutation<any, { id: number | string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.GATEWAY.DELETE_WALLET(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Gateway", id: "LIST" }],
    }),

    // Get wallet activities
    getWalletActivities: build.query<WalletActivity[], void>({
      query: () => ({
        url: ENDPOINTS.GATEWAY.WALLET_ACTIVITIES,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({
                type: "Gateway" as const,
                id: a.id,
              })),
              { type: "Gateway" as const, id: "LIST" },
            ]
          : [{ type: "Gateway" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateWalletMutation,
  useGetAllWalletsQuery,
  useSetActiveWalletMutation,
  useDeleteWalletMutation,
  useGetWalletActivitiesQuery,
} = walletApi;
