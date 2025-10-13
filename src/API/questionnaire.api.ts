// src/API/questionnaire.api.ts
import { baseApi } from "./baseApi";
import type {
  UserAnswersResponse,
  UserAnswerDto,
  InvestmentAnswersItemResponse,
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

    getInvestmentAnswersByUserId: build.query<
      InvestmentAnswersItemResponse,
      { id: string | number }
    >({
      query: ({ id }) => ({
        url: ENDPOINTS.USERS.INVESTMENT_QUESTIONS(id),
        method: "GET",
      }),
      transformResponse: (res: unknown) => {
        const raw = (res ?? {}) as InvestmentAnswersItemResponse;
        const data = Array.isArray(raw.data)
          ? raw.data.map((it) => ({
              ...it,
              investmentStatus: String(it.investmentStatus || "").toUpperCase(),
            }))
          : [];
        return { data };
      },
      providesTags: (_res, _err, arg) => [
        { type: "Users" as const, id: `CLIENTS:${arg.id}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserAnswersByUserIdQuery,
  useGetInvestmentAnswersByUserIdQuery,
} = questionnaireApi;
export default questionnaireApi;
