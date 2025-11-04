// src/API/broadcast.api.ts
import {
  NewsPost,
  NotificationItem,
  AllNewsPost,
} from "@/types/broadcast/news.types";
import { baseApi } from "./baseApi";
import { ENDPOINTS } from "@/constants/apiEndpoints";

// helper: normalize file urls shape
function normalizeFiles<
  T extends { fileUrls?: string[]; fileUrl?: string | null }
>(obj: T): T & { fileUrls: string[] } {
  const urls = Array.isArray(obj.fileUrls)
    ? (obj.fileUrls.filter(Boolean) as string[])
    : [];
  const single = obj.fileUrl ? [obj.fileUrl] : [];
  const merged = urls.length ? urls : single;
  return { ...obj, fileUrls: merged };
}

export const broadcastApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // CREATE NEWS (FormData: title, summary, banner?, files x N)
    createNews: build.mutation<NewsPost, FormData>({
      query: (formData) => ({
        url: ENDPOINTS.BROADCAST.CREATE_NEWS,
        method: "POST",
        data: formData,
      }),
      // if you want fresh normalized data from server response:
      transformResponse: (res: any): NewsPost =>
        normalizeFiles(res as NewsPost),
      invalidatesTags: [{ type: "Broadcast", id: "LIST" }],
    }),

    // GET ALL NEWS
    getAllNews: build.query<NewsPost[], void>({
      query: () => ({
        url: ENDPOINTS.BROADCAST.ALL_NEWS,
        method: "GET",
      }),
      transformResponse: (res: any): NewsPost[] => {
        const list = Array.isArray(res) ? res : [];
        return list.map((r) => normalizeFiles(r as NewsPost));
      },
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

    // GET NOTIFICATION BY USER ID
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
        body: formData, // <-- use body
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Broadcast", id: "LIST" },
      ],
    }),

    // EDIT NOTIFICATION
    editNotification: build.mutation<
      any,
      { id: number | string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: ENDPOINTS.BROADCAST.EDIT_NOTIFICATION(id),
        method: "PATCH",
        body: data, // <-- use body
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Broadcast", id: "LIST" },
      ],
    }),

    // DELETE NOTIFICATION
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

    // EDIT REPORT / NEWS (allow replacing banner/files, same keys)
    editReport: build.mutation<any, { id: number | string; data: FormData }>({
      query: ({ id, data }) => ({
        url: ENDPOINTS.BROADCAST.EDIT_REPORT(id),
        method: "PATCH",
        body: data, // <-- use body
      }),
      invalidatesTags: [
        { type: "Broadcast", id: "LIST" },
        { type: "Notification", id: "LIST" },
      ],
    }),

    // DELETE REPORT / NEWS
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
