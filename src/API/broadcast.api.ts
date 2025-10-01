// src/API/broadcast.api.ts
import {
  NewsPost,
  NotificationItem,
  NotificationsResponse,
} from "@/types/broadcast/news.types";
import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/constants/apiEndpoints";
import { AdminMessage } from "@/types/client";

export const broadcastApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // CREATE NEWS
    createNews: build.mutation<NewsPost, FormData>({
      query: (formData) => ({
        url: ENDPOINTS.BROADCAST.CREATE_NEWS,
        method: "POST",
        data: formData,
      }),
      invalidatesTags: [{ type: "Broadcast", id: "LIST" }],
    }),

    // GET ALL NEWS
    getAllNews: build.query<NewsPost[], void>({
      query: () => ({
        url: ENDPOINTS.BROADCAST.ALL_NEWS,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Broadcast" as const, id: r.id })),
              { type: "Broadcast" as const, id: "LIST" },
            ]
          : [{ type: "Broadcast" as const, id: "LIST" }],
    }),

    // GET ALL NOTIFICATIONS
    getAllNotifications: build.query<NotificationItem[], void>({
      query: () => ({
        url: ENDPOINTS.BROADCAST.ALL_NOTIFICATIONS,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "Notification" as const,
                id: r.id,
              })),
              { type: "Notification" as const, id: "LIST" },
            ]
          : [{ type: "Notification" as const, id: "LIST" }],
    }),

    // GET NOTIFICATION BY ID
    getNotificationsByUserId: build.query<NotificationItem[], number | string>({
      query: (id) => ({
        url: ENDPOINTS.USERS.USER_MESSAGE(id),
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "Notification" as const,
                id: r.id,
              })),
              { type: "Notification" as const, id: "LIST" },
            ]
          : [{ type: "Notification" as const, id: "LIST" }],
    }),

    // CREATE NOTIFICATION
    createNotification: build.mutation<
      { message: string; notification?: any },
      FormData
    >({
      query: (formData) => ({
        url: ENDPOINTS.BROADCAST.CREATE_NOTIFICATION,
        method: "POST",
        data: formData,
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Broadcast", id: "LIST" },
      ],
    }),

    /*******************
     * EDIT / DELETE mutations
     *******************/

    // Edit Notification
    editNotification: build.mutation<
      any,
      { id: number | string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: ENDPOINTS.BROADCAST.EDIT_NOTIFICATION(id),
        method: "PATCH",
        data,
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Broadcast", id: "LIST" },
      ],
    }),

    // Delete Notification
    deleteNotification: build.mutation<any, { id: number | string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.BROADCAST.DELETE_NOTIFICATION(id),
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Broadcast", id: "LIST" },
      ],
    }),

    // Edit Report / News
    editReport: build.mutation<any, { id: number | string; data: FormData }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.BROADCAST.EDIT_REPORT(id),
        method: "PATCH",
        data,
      }),
      invalidatesTags: [
        { type: "Broadcast", id: "LIST" },
        { type: "Notification", id: "LIST" },
      ],
    }),

    // Delete Report / News
    deleteReport: build.mutation<any, { id: number | string }>({
      query: ({ id }) => ({
        url: ENDPOINTS.BROADCAST.DELETE_REPORT(id),
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Broadcast", id: "LIST" },
        { type: "Notification", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateNewsMutation,
  useGetAllNewsQuery,
  useCreateNotificationMutation,
  useGetAllNotificationsQuery,
  useEditNotificationMutation,
  useDeleteNotificationMutation,
  useEditReportMutation,
  useDeleteReportMutation,
  useGetNotificationsByUserIdQuery,
} = broadcastApi;
