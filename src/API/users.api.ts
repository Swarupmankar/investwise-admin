// src/API/users.api.ts
import { ENDPOINTS } from "@/constants/apiEndpoints";
import { baseApi } from "./baseApi";
import type { UserApi } from "@/types/users/users.types";
import { UserDetailApi } from "@/types/users/userDetail.types";

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
  }),
  overrideExisting: false,
});

export const { useGetAllUsersQuery, useGetUserByIdQuery } = usersApi;
