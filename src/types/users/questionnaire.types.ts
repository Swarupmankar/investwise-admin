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

export type UserAnswersResponse = UserAnswerDto[]; // array of answers
