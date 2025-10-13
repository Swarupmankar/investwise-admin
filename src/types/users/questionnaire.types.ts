// src/types/questionnaire.types.ts
export type QuestionDto = {
  id: number;
  question: string;
};

export type UserAnswerDto = {
  id: number;
  userId: number;
  questionId: number;
  answer: string;
  question: QuestionDto;
};

export type UserAnswersResponse = UserAnswerDto[];

export type InvestmentStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | string;

export interface InvestmentAnswersItem {
  id: number;
  name: string;
  forWhome: string;
  duration: string;
  amount: number;
  investmentStatus: InvestmentStatus; // "ACTIVE" | "PAUSED" | etc.
  referralCode: string | null;
}

export interface InvestmentAnswersItemResponse {
  data: InvestmentAnswersItem[];
}
