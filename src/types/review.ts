import type { Answer, Question } from "./database";

export interface AnswerWithQuestion {
  answer: Answer;
  question: Question;
}

export interface ReportPayload {
  reportType: string;
  reportText: string;
}
