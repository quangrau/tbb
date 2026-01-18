export interface SubmitQuestionReportParams {
  questionId: string;
  roomId: string | null;
  playerId: string | null;
  reportType: string;
  reportText: string;
  selectedOptionIndex: number | null;
  answerText: string | null;
}

export async function submitQuestionReport(
  params: SubmitQuestionReportParams,
): Promise<void> {
  void params;
}

