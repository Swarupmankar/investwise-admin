// src/API/questionnaire.api.ts
import { baseApi } from "./baseApi";
import type {
  UserAnswersResponse,
  UserAnswerDto,
} from "@/types/users/questionnaire.types";
import { ENDPOINTS } from "@/constants/apiEndpoints";

export const questionnaireApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUserAnswersByUserId: build.query<UserAnswersResponse, number>({
      query: (userId) => {
        return {
          url: ENDPOINTS.USERS.USER_ANSWERS(userId),
          method: "GET" as const,
        };
      },

      transformResponse: (raw: any) => {
        const payload = raw?.data ?? raw;
        if (!payload) return [];

        if (!Array.isArray(payload)) {
          const maybeArray = Array.isArray(payload.userAnswers)
            ? payload.userAnswers
            : [];
          return maybeArray;
        }

        const arr = payload as any[];
        const normalized: UserAnswerDto[] = arr.map((item) => ({
          id: Number(item.id),
          userId: Number(item.userId),
          questionId: Number(item.questionId),
          answer: item.answer ?? "",
          question: {
            id: Number(item?.question?.id ?? item.questionId ?? 0),
            question: item?.question?.question ?? String(item?.question ?? ""),
          },
        }));

        return normalized;
      },

      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map((r) => ({
                type: "Users" as const,
                id: r.id,
              })),
              { type: "Users" as const, id: userId },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUserAnswersByUserIdQuery } = questionnaireApi;
export default questionnaireApi;
