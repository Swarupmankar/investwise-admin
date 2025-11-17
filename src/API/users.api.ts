// src/API/users.api.ts
import { ENDPOINTS } from "@/constants/apiEndpoints";
import { baseApi } from "./baseApi";
import type { UserApi } from "@/types/users/users.types";
import {
  ReturnsHistoryItem,
  UserDetailApi,
} from "@/types/users/userDetail.types";
import { PauseResumeRequest, PauseResumeResponse } from "@/types/client";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Return an array now
    getAllUsers: build.query<
      UserApi[],
      { skip?: number; take?: number; q?: string } | void
    >({
      query: (params) => {
        const url = ENDPOINTS.USERS.ALL_USERS;
        return {
          url,
          method: "GET",
          params: params
            ? {
                ...(params.skip !== undefined ? { skip: params.skip } : {}),
                ...(params.take !== undefined ? { take: params.take } : {}),
                ...(params.q ? { q: params.q } : {}),
              }
            : {},
        };
      },
      providesTags: (res) =>
        res
          ? [
              ...res.map((u) => ({ type: "Users" as const, id: u.id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    //  get user by id
    getUserById: build.query<UserDetailApi, number>({
      query: (id) => ({
        url: ENDPOINTS.USERS.USER_BY_ID(id),
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Users" as const, id }],
    }),

    pauseInvestment: build.mutation<PauseResumeResponse, PauseResumeRequest>({
      query: ({ id }) => ({
        url: ENDPOINTS.USERS.PAUSE(id),
        method: "GET",
      }),
      // Invalidate investment list or specific id so UI can refetch updated data
      invalidatesTags: (_res, _err, arg) => [
        { type: "Investment" as const, id: "LIST" },
        { type: "Investment" as const, id: String(arg.id) },
      ],
      transformResponse: (res: unknown) => (res ?? {}) as PauseResumeResponse,
    }),

    // Resume investment
    resumeInvestment: build.mutation<PauseResumeResponse, PauseResumeRequest>({
      query: ({ id }) => ({
        url: ENDPOINTS.USERS.RESUME(id),
        method: "GET",
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Investment" as const, id: "LIST" },
        { type: "Investment" as const, id: String(arg.id) },
      ],
      transformResponse: (res: unknown) => (res ?? {}) as PauseResumeResponse,
    }),

    //  NEW: getClientReturnsHistory
    getClientReturnsHistory: build.query<ReturnsHistoryItem[], number>({
      query: (id: number) => ({
        url: ENDPOINTS.USERS.USERS_INVESTMENT_HISTORY(id),
        method: "GET",
      }),
      providesTags: (res, _err, id) =>
        res
          ? [
              ...res.map((r) => ({
                type: "Investment" as const,
                id: `${id}-${r.investmentId}`,
              })),
              { type: "Investment" as const, id: `CLIENT-${id}` },
            ]
          : [{ type: "Investment" as const, id: `CLIENT-${id}` }],
      transformResponse: (res: unknown) => (res ?? []) as ReturnsHistoryItem[],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  usePauseInvestmentMutation,
  useResumeInvestmentMutation,
  useGetClientReturnsHistoryQuery,
} = usersApi;
