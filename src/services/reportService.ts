import { supabase } from "../config/supabase";

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
  const {
    questionId,
    roomId,
    playerId,
    reportType,
    reportText,
    selectedOptionIndex,
    answerText,
  } = params;

  const { error } = await supabase.from("question_reports").insert({
    question_id: questionId,
    room_id: roomId,
    player_id: playerId,
    report_type: reportType,
    report_text: reportText.length > 0 ? reportText : null,
    selected_option_index: selectedOptionIndex,
    answer_text: answerText,
  });

  if (error) throw new Error(`Failed to submit report: ${error.message}`);
}
